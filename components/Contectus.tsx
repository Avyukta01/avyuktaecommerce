"use client";

import React, { useState } from "react";
import { Mail, Phone, MapPin, Clock, MessageCircle, Send } from "lucide-react";
import toast from "react-hot-toast";

const Contactus = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Message sent successfully! We'll get back to you soon.");
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <section
      style={{
        padding: "3rem 1rem",
        background: "linear-gradient(135deg, #f8f9fa, #e9f3ff)",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <div
            style={{
              width: 70,
              height: 70,
              margin: "0 auto 1rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#fff",
              borderRadius: "50%",
              boxShadow: "0 2px 15px rgba(0,0,0,0.1)",
            }}
          >
            <MessageCircle className="text-primary" size={35} />
          </div>
          <h1 style={{ fontWeight: 700, fontSize: "2.5rem", color: "#1f2937" }}>
            Get in <span style={{ color: "#0d6efd" }}>Touch</span>
          </h1>
          <p
            style={{
              maxWidth: 700,
              margin: "1rem auto 0",
              color: "#6c757d",
              fontSize: "1rem",
            }}
          >
            Have questions or need assistance? We're here to help! Send us a message and we'll respond within 24 hours.
          </p>
        </div>

        {/* Main Content */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            {/* Contact Form */}
            <div
              style={{
                backgroundColor: "#fff",
                borderRadius: "1rem",
                boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                padding: "2rem",
              }}
            >
              <h2 style={{ fontWeight: 700, marginBottom: "1rem", color: "#1f2937" }}>
                Send us a Message
              </h2>
              <p style={{ color: "#6c757d", marginBottom: "1.5rem" }}>
                Fill out the form below and we'll get back to you as soon as possible.
              </p>
              <form onSubmit={handleSubmit}>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Full Name *"
                  required
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    borderRadius: "0.75rem",
                    border: "1px solid #ced4da",
                    marginBottom: "1rem",
                  }}
                />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email Address *"
                  required
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    borderRadius: "0.75rem",
                    border: "1px solid #ced4da",
                    marginBottom: "1rem",
                  }}
                />
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Subject *"
                  required
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    borderRadius: "0.75rem",
                    border: "1px solid #ced4da",
                    marginBottom: "1rem",
                  }}
                />
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Your Message *"
                  required
                  rows={6}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    borderRadius: "0.75rem",
                    border: "1px solid #ced4da",
                    marginBottom: "1rem",
                  }}
                ></textarea>
                <button
                  type="submit"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    width: "100%",
                    padding: "0.75rem",
                    backgroundColor: "#0d6efd",
                    color: "#fff",
                    fontWeight: 600,
                    border: "none",
                    borderRadius: "0.75rem",
                    cursor: "pointer",
                  }}
                >
                  <Send size={20} /> Send Message
                </button>
              </form>
            </div>

            {/* Contact Info */}
            <div
              style={{
                backgroundColor: "#fff",
                borderRadius: "1rem",
                boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                padding: "2rem",
              }}
            >
              <h4 style={{ fontWeight: 700, marginBottom: "1rem", color: "#1f2937" }}>
                Contact Information
              </h4>
              {[
                {
                  icon: <Mail className="text-primary" />,
                  title: "Email",
                  lines: ["support@avyukta.com", "info@avyukta.com"],
                },
                {
                  icon: <Phone className="text-success" />,
                  title: "Phone",
                  lines: ["+91 98765 43210", "+91 87654 32109"],
                },
                {
                  icon: <MapPin className="text-danger" />,
                  title: "Address",
                  lines: ["123 Avyukta Tower, MG Road,", "New Delhi, India 110001"],
                },
                {
                  icon: <Clock className="text-warning" />,
                  title: "Business Hours",
                  lines: ["Mon - Fri: 9:00 AM - 6:00 PM", "Sat: 10:00 AM - 4:00 PM", "Sun: Closed"],
                },
              ].map((item, index) => (
                <div key={index} style={{ display: "flex", gap: "1rem", marginBottom: "1rem", alignItems: "flex-start" }}>
                  <div
                    style={{
                      width: 50,
                      height: 50,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "#f1f5f9",
                      borderRadius: "0.75rem",
                      flexShrink: 0,
                    }}
                  >
                    {item.icon}
                  </div>
                  <div>
                    <h6 style={{ fontWeight: 600, marginBottom: "0.25rem", color: "#1f2937" }}>
                      {item.title}
                    </h6>
                    {item.lines.map((line, i) => (
                      <p key={i} style={{ margin: 0, color: "#6c757d", fontSize: "0.875rem" }}>
                        {line}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Map */}
            <div
              style={{
                borderRadius: "1rem",
                overflow: "hidden",
                boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                marginTop: "1rem",
              }}
            >
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14012.890033074412!2d77.21672175!3d28.6328726!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ce2b32780d2a9%3A0xdee50d792f2d1a86!2sConnaught%20Place%2C%20New%20Delhi!5e0!3m2!1sen!2sin!4v1685806191260!5m2!1sen!2sin"
                style={{ width: "100%", height: 300, border: 0 }}
                loading="lazy"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div style={{ marginTop: "3rem" }}>
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <h2 style={{ fontWeight: 700, color: "#1f2937" }}>Frequently Asked Questions</h2>
            <p style={{ color: "#6c757d" }}>Quick answers to common questions</p>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
            {[
              {
                question: "How quickly do you respond?",
                answer: "We typically respond to all inquiries within 24 hours during business days.",
              },
              {
                question: "Do you offer phone support?",
                answer: "Yes! You can reach us at +91 98765 43210 during business hours.",
              },
              {
                question: "What's your response time?",
                answer: "Most queries are answered within 2–4 hours during business hours.",
              },
            ].map((faq, index) => (
              <div
                key={index}
                style={{
                  flex: "1 1 300px",
                  backgroundColor: "#fff",
                  borderRadius: "1rem",
                  boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
                  padding: "1.5rem",
                }}
              >
                <h5 style={{ fontWeight: 600, marginBottom: "0.5rem", color: "#1f2937" }}>
                  {faq.question}
                </h5>
                <p style={{ margin: 0, color: "#6c757d", fontSize: "0.875rem" }}>{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contactus;
