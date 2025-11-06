

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const { asyncHandler, AppError } = require("../utills/errorHandler");

const {
  parseCsvBufferToRows,
  validateRow,
  createBatchWithItems,
  computeBatchStatus,
  getBatchSummary,
  canDeleteProductsForBatch,
  applyItemUpdates,
} = require("../services/bulkUploadService");


const uploadCsvAndCreateBatch = asyncHandler(async (req, res) => {
  

  const csvFile = req.files?.file;
  if (!csvFile) {
    
    throw new AppError("CSV file is required (field name: 'file')", 400);
  }

 

  const rows = await parseCsvBufferToRows(csvFile.data);


  if (!rows || rows.length === 0) {
    throw new AppError("CSV has no rows", 400);
  }

  const valid = [];
  const errors = [];
  for (let i = 0; i < rows.length; i++) {
    const { ok, data, error } = validateRow(rows[i]);
    if (ok) valid.push(data);
    else errors.push({ index: i + 1, error });
  }



  //  Use transaction for consistency
  const result = await prisma.$transaction(async (tx) => {
    // Create batch record
    const createdBatch = await tx.bulk_upload_batch.create({
      data: {
        fileName: csvFile.name,
        status: "PENDING",
        itemCount: rows.length,
        errorCount: errors.length,
        uploadedById: req.user?.id || null,
      },
    });


    const { successCount, errorCount } = await createBatchWithItems(
      tx,
      createdBatch.id,
      valid,
      errors
    );

    const finalStatus = computeBatchStatus(successCount, errorCount);

    const updatedBatch = await tx.bulk_upload_batch.update({
      where: { id: createdBatch.id },
      data: {
        status: finalStatus,
        itemCount: successCount + errorCount,
        errorCount,
      },
    });

    
    return updatedBatch;
  });

  const summary = await getBatchSummary(prisma, result.id);

  return res.status(201).json({
    batchId: result.id,
    fileName: result.fileName,
    status: result.status,
    message: "Bulk upload completed successfully!",
    ...summary,
    validationErrors: errors.length > 0 ? errors : undefined,
  });
});

// -----------------------------------------------------------------------------
// GET /api/bulk-upload
// List all batches with details
// -----------------------------------------------------------------------------
const listBatches = asyncHandler(async (req, res) => {
  const batches = await prisma.bulk_upload_batch.findMany({
    orderBy: { createdAt: "desc" },
  });

  const batchesWithDetails = await Promise.all(
    batches.map(async (batch) => {
      const items = await prisma.bulk_upload_item.findMany({
        where: { batchId: batch.id },
      });

      const successfulRecords = items.filter(
        (item) => item.status === "CREATED" && item.productId !== null
      ).length;

      const failedRecords = items.filter(
        (item) => item.status === "ERROR" || item.error !== null
      ).length;

      const errors = items
        .filter((item) => item.error)
        .map((item) => item.error);

      return {
        id: batch.id,
        fileName: batch.fileName || `batch-${batch.id.substring(0, 8)}.csv`,
        totalRecords: items.length,
        successfulRecords,
        failedRecords,
        status: batch.status,
        uploadedBy: "Admin",
        uploadedAt: batch.createdAt,
        errors: errors.length > 0 ? errors : undefined,
      };
    })
  );

  return res.json({ batches: batchesWithDetails });
});

// -----------------------------------------------------------------------------
// GET /api/bulk-upload/:batchId
// Fetch a single batch with all uploaded items
// -----------------------------------------------------------------------------
const getBatchDetail = asyncHandler(async (req, res) => {
  const { batchId } = req.params;
  if (!batchId) throw new AppError("Batch ID is required", 400);

  const batch = await prisma.bulk_upload_batch.findUnique({
    where: { id: batchId },
  });
  if (!batch) throw new AppError("Batch not found", 404);

  const items = await prisma.bulk_upload_item.findMany({
    where: { batchId },
    include: { product: true },
  });

  return res.json({ batch, items });
});

// -----------------------------------------------------------------------------
// PUT /api/bulk-upload/:batchId
// Update batch items (price, stock)
// -----------------------------------------------------------------------------
const updateBatchItems = asyncHandler(async (req, res) => {
  const { batchId } = req.params;
  const { items } = req.body;

  if (!batchId) throw new AppError("Batch ID is required", 400);
  if (!Array.isArray(items) || items.length === 0) {
    throw new AppError("Items array is required", 400);
  }

  const updated = await prisma.$transaction(async (tx) => {
    return await applyItemUpdates(tx, batchId, items);
  });

  return res.json({ updatedCount: updated.length, items: updated });
});

// -----------------------------------------------------------------------------
// DELETE /api/bulk-upload/:batchId?deleteProducts=true/false
// -----------------------------------------------------------------------------
const deleteBatch = asyncHandler(async (req, res) => {
  const { batchId } = req.params;
  const deleteProducts = req.query.deleteProducts === "true";

  if (!batchId) throw new AppError("Batch ID is required", 400);

  

  const batch = await prisma.bulk_upload_batch.findUnique({
    where: { id: batchId },
  });

  if (!batch) throw new AppError("Batch not found", 404);

  if (deleteProducts) {
   
    const check = await canDeleteProductsForBatch(prisma, batchId);
    

    if (!check.canDelete) {
      const errorMsg =
        check.blockedProductIds && check.blockedProductIds.length > 0
          ? `Cannot delete products: ${
              check.reason
            }. Products in orders: ${check.blockedProductIds.join(", ")}`
          : `Cannot delete products: ${check.reason || "Unknown error"}`;

      throw new AppError(errorMsg, 409);
    }

    // Delete batch, items, and products
    await prisma.$transaction(async (tx) => {
      const items = await tx.bulk_upload_item.findMany({
        where: { batchId, productId: { not: null } },
        select: { productId: true },
      });

      const productIds = items.map((i) => i.productId).filter(Boolean);
      

      if (productIds.length > 0) {
        const deletedProducts = await tx.product.deleteMany({
          where: { id: { in: productIds } },
        });
     
      }

      const deletedItems = await tx.bulk_upload_item.deleteMany({
        where: { batchId },
      });
     

      await tx.bulk_upload_batch.delete({ where: { id: batchId } });
      
    });

   
    return res.status(200).json({
      success: true,
      message: "Batch and products deleted successfully",
      deletedProducts: true,
    });
  } else {
    // Delete batch + items only
    await prisma.$transaction(async (tx) => {
      const deletedItems = await tx.bulk_upload_item.deleteMany({
        where: { batchId },
      });
      

      await tx.bulk_upload_batch.delete({
        where: { id: batchId },
      });
   
    });

    
    return res.status(200).json({
      success: true,
      message: "Batch deleted successfully (products kept)",
      deletedProducts: false,
    });
  }
});

// -----------------------------------------------------------------------------
// Export Controller
// -----------------------------------------------------------------------------
module.exports = {
  uploadCsvAndCreateBatch,
  listBatches,
  getBatchDetail,
  updateBatchItems,
  deleteBatch,
};
