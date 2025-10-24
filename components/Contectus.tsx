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
    <section className="py-5" style={{ background: "linear-gradient(135deg, #f8f9fa, #e9f3ff)" }}>
      <div className="container">
        {/* Hero Section */}
        <div className="text-center mb-5">
          <div className="d-inline-flex align-items-center justify-content-center bg-light rounded-circle mb-3" style={{ width: 70, height: 70 }}>
            <MessageCircle className="text-primary" size={35} />
          </div>
          <h1 className="fw-bold display-5 text-dark">
            Get in <span className="text-primary">Touch</span>
          </h1>
          <p className="text-muted fs-5 mx-auto" style={{ maxWidth: 700 }}>
            Have questions or need assistance? We're here to help! Send us a message and we'll respond within 24 hours.
          </p>
        </div>

        <div className="row g-4">
          {/* Contact Form */}
          <div className="col-lg-8">
            <div className="card border-0 shadow-lg rounded-4">
              <div className="card-body p-4 p-lg-5">
                <h2 className="fw-bold mb-3 text-dark">Send us a Message</h2>
                <p className="text-muted mb-4">Fill out the form below and we'll get back to you as soon as possible.</p>

                <form onSubmit={handleSubmit}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Full Name *</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                        required
                        className="form-control rounded-3"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Email Address *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your email"
                        required
                        className="form-control rounded-3"
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-semibold">Subject *</label>
                      <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder="What's this about?"
                        required
                        className="form-control rounded-3"
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-semibold">Message *</label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        rows={6}
                        placeholder="Tell us more about your inquiry..."
                        required
                        className="form-control rounded-3"
                      ></textarea>
                    </div>
                    <div className="col-12">
                      <button type="submit" className="btn btn-primary w-100 py-3 fw-semibold rounded-3 d-flex justify-content-center align-items-center gap-2">
                        <Send size={20} /> Send Message
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Contact Info & Map */}
          <div className="col-lg-4">
            <div className="card border-0 shadow-lg rounded-4 mb-4">
              <div className="card-body p-4">
                <h4 className="fw-bold text-dark mb-4">Contact Information</h4>

                <div className="d-flex align-items-start mb-4">
                  <div className="bg-light rounded-3 p-3 me-3">
                    <Mail className="text-primary" />
                  </div>
                  <div>
                    <h6 className="fw-semibold text-dark mb-1">Email</h6>
                    <p className="text-muted mb-0">support@avyukta.com</p>
                    <p className="text-muted">info@avyukta.com</p>
                  </div>
                </div>

                <div className="d-flex align-items-start mb-4">
                  <div className="bg-light rounded-3 p-3 me-3">
                    <Phone className="text-success" />
                  </div>
                  <div>
                    <h6 className="fw-semibold text-dark mb-1">Phone</h6>
                    <p className="text-muted mb-0">+91 98765 43210</p>
                    <p className="text-muted">+91 87654 32109</p>
                  </div>
                </div>

                <div className="d-flex align-items-start mb-4">
                  <div className="bg-light rounded-3 p-3 me-3">
                    <MapPin className="text-danger" />
                  </div>
                  <div>
                    <h6 className="fw-semibold text-dark mb-1">Address</h6>
                    <p className="text-muted mb-0">123 Avyukta Tower, MG Road,</p>
                    <p className="text-muted">New Delhi, India 110001</p>
                  </div>
                </div>

                <div className="d-flex align-items-start">
                  <div className="bg-light rounded-3 p-3 me-3">
                    <Clock className="text-warning" />
                  </div>
                  <div>
                    <h6 className="fw-semibold text-dark mb-1">Business Hours</h6>
                    <p className="text-muted mb-0">Mon - Fri: 9:00 AM - 6:00 PM</p>
                    <p className="text-muted mb-0">Sat: 10:00 AM - 4:00 PM</p>
                    <p className="text-muted">Sun: Closed</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Map */}
            <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="card-body p-3">
                <h5 className="fw-bold text-dark mb-2">Find Us</h5>
                <p className="text-muted mb-3">Visit our office location</p>
                <div className="ratio ratio-4x3 rounded-3 overflow-hidden">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14012.890033074412!2d77.21672175!3d28.6328726!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ce2b32780d2a9%3A0xdee50d792f2d1a86!2sConnaught%20Place%2C%20New%20Delhi!5e0!3m2!1sen!2sin!4v1685806191260!5m2!1sen!2sin"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-5 pt-5">
          <div className="text-center mb-5">
            <h2 className="fw-bold text-dark">Frequently Asked Questions</h2>
            <p className="text-muted">Quick answers to common questions</p>
          </div>

          <div className="row g-4">
            <div className="col-md-4">
              <div className="card border-0 shadow-sm h-100 rounded-4">
                <div className="card-body">
                  <h5 className="fw-semibold text-dark mb-2">How quickly do you respond?</h5>
                  <p className="text-muted small">We typically respond to all inquiries within 24 hours during business days.</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card border-0 shadow-sm h-100 rounded-4">
                <div className="card-body">
                  <h5 className="fw-semibold text-dark mb-2">Do you offer phone support?</h5>
                  <p className="text-muted small">Yes! You can reach us at +91 98765 43210 during business hours.</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card border-0 shadow-sm h-100 rounded-4">
                <div className="card-body">
                  <h5 className="fw-semibold text-dark mb-2">What's your response time?</h5>
                  <p className="text-muted small">Most queries are answered within 2–4 hours during business hours.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contactus;
