import React, { useState } from 'react';

const ContactUs = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    // Here you would send the form data to your backend or email service
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-2">Contact Us</h1>
      <p className="text-xs text-gray-500 mb-6">Last updated on 17-07-2025 11:45:25</p>
      <div className="mb-6 space-y-2">
        <p><span className="font-semibold">Merchant Legal entity name:</span> SATYAM PATIDAR</p>
        <p><span className="font-semibold">Registered Address:</span> Graam- Jeeran, Tahsil- Jeeran, Jeeran, Madhya Pradesh, PIN: 458336</p>
        <p><span className="font-semibold">Operational Address:</span> Graam- Jeeran, Tahsil- Jeeran, Jeeran, Madhya Pradesh, PIN: 458336</p>
        <p><span className="font-semibold">Telephone No:</span> <a href="tel:7089290615" className="text-primary-600 underline">7089290615</a></p>
        <p><span className="font-semibold">E-Mail ID:</span> <a href="mailto:satyamjeeran@gmail.com" className="text-primary-600 underline">satyamjeeran@gmail.com</a></p>
      </div>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
        <div className="mb-4">
          <label className="block mb-1 font-semibold">Name</label>
          <input type="text" name="name" value={form.name} onChange={handleChange} required className="w-full border border-gray-300 rounded px-3 py-2" />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-semibold">Email</label>
          <input type="email" name="email" value={form.email} onChange={handleChange} required className="w-full border border-gray-300 rounded px-3 py-2" />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-semibold">Message</label>
          <textarea name="message" value={form.message} onChange={handleChange} required className="w-full border border-gray-300 rounded px-3 py-2" rows={4}></textarea>
        </div>
        <button type="submit" className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700">Send Message</button>
        {submitted && <p className="mt-4 text-green-600">Thank you for contacting us! We will get back to you soon.</p>}
      </form>
    </div>
  );
};

export default ContactUs; 