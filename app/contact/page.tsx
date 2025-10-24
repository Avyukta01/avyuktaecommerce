import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Contactus from "@/components/Contectus";

const ContactPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Contactus/>
      <Footer />
    </div>
  );
};

export default ContactPage;
