"use client";
import { DashboardSidebar } from "@/components";
import { isValidEmailAddressFormat } from "@/lib/utils";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { sanitizeFormData } from "@/lib/form-sanitize";
import apiClient from "@/lib/api";

const DashboardCreateNewUser = () => {
  const [userInput, setUserInput] = useState<{
    email: string;
    password: string;
    role: string;
  }>({
    email: "",
    password: "",
    role: "user",
  });

  const addNewUser = async () => {
    if (userInput.email === "" || userInput.password === "") {
      toast.error("You must enter all input values to add a user");
      return;
    }

    // Sanitize form data before sending to API
    const sanitizedUserInput = sanitizeFormData(userInput);

    if (
      userInput.email.length > 3 &&
      userInput.role.length > 0 &&
      userInput.password.length > 0
    ) {
      if (!isValidEmailAddressFormat(userInput.email)) {
        toast.error("You entered invalid email address format");
        return;
      }

      if (userInput.password.length > 7) {
        apiClient.post(`/api/users`, sanitizedUserInput)
          .then((response) => {
            if(response.status === 201){
              return response.json();

            }else{
              
              throw Error("Error while creating user");
            }
          })
          .then((data) => {
            toast.success("User added successfully");
            setUserInput({
              email: "",
              password: "",
              role: "user",
            });
          }).catch(error => {
            toast.error("Error while creating user");
          });
      } else {
        toast.error("Password must be longer than 7 characters");
      }
    } else {
      toast.error("You must enter all input values to add a user");
    }
  };

  return (
    <div className="bg-white flex justify-start max-w-screen-2xl mx-auto xl:h-full max-xl:flex-col max-xl:gap-y-5">
      <DashboardSidebar />
      <div className="flex flex-col gap-y-7 xl:pl-5 max-xl:px-5 w-full">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Two Column Vertical Form</h1>
          <p className="text-gray-600">Personal Details</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Name:</label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter name"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2">Password:</label>
                <input
                  type="password"
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter password"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2">State:</label>
                <select className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Select State</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2">Your Message:</label>
                <textarea
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
                  placeholder="Enter message"
                ></textarea>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">First Name:</label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter first name"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2">Last Name:</label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter last name"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2">Email:</label>
                <input
                  type="email"
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={userInput.email}
                  onChange={(e) =>
                    setUserInput({ ...userInput, email: e.target.value })
                  }
                  placeholder="Enter email"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2">Phone:</label>
                <input
                  type="tel"
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter phone number"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2">Address line:</label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter address"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2">Country:</label>
                <select className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Select Country</option>
                  <option value="india">India</option>
                  <option value="usa">USA</option>
                  <option value="uk">UK</option>
                </select>
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2">State/Province:</label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter state/province"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2">ZIP code:</label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter ZIP code"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2">City:</label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter city"
                />
              </div>
            </div>
          </form>
          
          {/* Submit Button */}
          <div className="flex justify-end mt-8">
            <button
              type="button"
              className="bg-orange-500 text-white px-8 py-3 rounded-md font-medium hover:bg-orange-600 transition-colors"
              onClick={addNewUser}
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardCreateNewUser;
