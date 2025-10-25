"use client";

import React from "react";

const Privacy = () => {
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
          Privacy Policy
        </h1>

        {/* Section: Introduction */}
        <p
          style={{
            marginBottom: "1rem",
            color: "#6c757d",
            lineHeight: 1.7,
            fontSize: "1rem",
          }}
        >
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio.
          Praesent libero. Sed cursus ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet.
        </p>

        {/* Sections */}
        {[
          { title: "Information We Collect", content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur sit amet eros blandit, dictum felis ut, fermentum nisl." },
          { title: "How We Use Your Information", content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque sit amet est et sapien ullamcorper pharetra." },
          { title: "Cookies", content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa." },
          { title: "Third-Party Services", content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cum sociis natoque penatibus et magnis dis parturient montes." },
          { title: "Contact Us", content: "If you have any questions about our Privacy Policy, please contact us at support@avyukta.com." },
        ].map((section, idx) => (
          <div key={idx} style={{ marginBottom: "2rem" }}>
            <h2
              style={{
                fontSize: "1.5rem",
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
                wordBreak: "break-word",
              }}
            >
              {section.content.includes("support@avyukta.com") ? (
                <>
                  If you have any questions about our Privacy Policy, please contact us at{" "}
                  <a href="mailto:support@avyukta.com" style={{ color: "#0d6efd" }}>
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

export default Privacy;
