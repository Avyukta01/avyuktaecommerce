"use client";

import React from "react";

const TermsCondition = () => {
  return (
    <section
      style={{
        padding: "3rem 1rem",
        backgroundColor: "#f8f9fa",
        minHeight: "100vh",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          maxWidth: 900,
          margin: "0 auto",
          width: "100%",
          boxSizing: "border-box",
          padding: "0 1rem",
        }}
      >
        {/* Title */}
        <h1
          style={{
            fontSize: "2.25rem",
            fontWeight: 700,
            textAlign: "center",
            marginBottom: "2rem",
            color: "#1f2937",
          }}
        >
          Terms & Conditions
        </h1>

        {/* Introduction */}
        <p
          style={{
            marginBottom: "2rem",
            color: "#6c757d",
            lineHeight: 1.8,
            fontSize: "1rem",
            textAlign: "justify",
          }}
        >
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. By using our website, you agree to comply with and be bound by the following terms and conditions of use.
        </p>

        {/* Sections */}
        {[
          { title: "Acceptance of Terms", content: "By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement." },
          { title: "Use of Website", content: "You agree to use the website only for lawful purposes and in a way that does not infringe the rights of, restrict or inhibit anyone else's use and enjoyment of the website." },
          { title: "Intellectual Property", content: "All content, trademarks, and data on this website are the property of the company or its licensors and are protected by intellectual property laws." },
          { title: "Limitation of Liability", content: "In no event shall the company be liable for any damages arising out of or in connection with the use of this website." },
          { title: "Modifications", content: "We reserve the right to modify or terminate the website or its services at any time without prior notice." },
          { title: "Governing Law", content: "These terms shall be governed in accordance with the laws of India, and any disputes shall be subject to the jurisdiction of the Indian courts." },
          { title: "Contact Us", content: "If you have any questions about our Terms & Conditions, please contact us at support@avyukta.com." },
        ].map((section, idx) => (
          <div key={idx} style={{ marginBottom: "2.5rem" }}>
            <h2
              style={{
                fontSize: "1.75rem",
                fontWeight: 600,
                marginBottom: "0.75rem",
                color: "#1f2937",
              }}
            >
              {section.title}
            </h2>
            <p
              style={{
                margin: 0,
                color: "#6c757d",
                lineHeight: 1.7,
                fontSize: "1rem",
                textAlign: "justify",
                wordBreak: "break-word",
              }}
            >
              {section.content.includes("support@avyukta.com") ? (
                <>
                  If you have any questions about our Terms & Conditions, please contact us at{" "}
                  <a href="mailto:support@avyukta.com" style={{ color: "#0d6efd", textDecoration: "underline" }}>
                    support@avyukta.com
                  </a>.
                </>
              ) : (
                section.content
              )}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TermsCondition;
