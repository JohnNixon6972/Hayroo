import React from 'react';
import { Footer, Navber } from '../shop/partials';

function ContactUs() {
  const developers = [
    {
      name: 'John Nixon',
      role: 'Software Engineer',
      image:
        'https://media.licdn.com/dms/image/v2/D4E03AQHJVptaNod77w/profile-displayphoto-shrink_400_400/B4EZOr_8TpHEAk-/0/1733757486876?e=1752105600&v=beta&t=9j8J3NZl5q1ypm9NFzsamOINJ9Ld645JUs-bfmRzLac',
      phone: '+91-6363850983',
    },
    {
      name: 'Sahana Joshi',
      role: 'Software Engineer',
      image:
        'https://media.licdn.com/dms/image/v2/D5603AQHxN3SPnoeEiw/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1671181528902?e=1752105600&v=beta&t=3AtivFtKdVLIt1i8WGoG9KXue2szG2DZ0qwYTgxcAJY',
      phone: '+91-7349639766',
    },
  ];

  return (
    <div>
      <Navber />
      {/* <section className="bg-gray-100 pt-24 pb-12" id="developers">
        <div className="max-w-6xl mx-auto px-4">
          <h3 className="text-3xl font-semibold text-center text-gray-800 mb-12">
            Know the Developers
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-8">
            {developers.map((dev, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-xl transition"
              >
                <img
                  src={dev.image}
                  alt={dev.name}
                  className="w-28 h-28 mx-auto rounded-full mb-4 object-cover"
                />
                <h4 className="text-xl font-bold text-gray-700">{dev.name}</h4>
                <p className="text-blue-500 mb-2">{dev.role}</p>
                <p className="text-gray-600 font-medium">📞 {dev.phone}</p>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      <section className="bg-white pt-32 h-[90vh] border-t border-gray-200" id="company">
        <div className="max-w-6xl mx-auto px-4">
          <h3 className="text-3xl font-semibold text-center text-gray-800 mb-12">Company Details</h3>
          <div className="flex flex-col md:flex-row items-start gap-8">

            {/* Map Left */}
            <div className="w-full md:w-1/2">
              <iframe
                title="ShopEase Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3890.114434625956!2d77.60617147507303!3d12.975222587342988!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae1670c6a1b54f%3A0xd8c5ee956d6e60df!2sMG%20Road%2C%20Bengaluru%2C%20Karnataka%20560001!5e0!3m2!1sen!2sin!4v1628754041347!5m2!1sen!2sin"
                width="100%"
                height="300"
                allowFullScreen=""
                loading="lazy"
                className="rounded-lg border"
              ></iframe>
            </div>

            {/* Details Right */}
            <div className="w-full md:w-1/2 flex flex-col justify-center">
              <p className="text-lg text-gray-700 font-medium">ShopEase eCommerce Pvt. Ltd.</p>
              <p className="text-gray-600 mt-2">#24, 2nd Floor, MG Road, Bangalore, Karnataka - 560001, India</p>
              <p className="text-gray-600 mt-2">📧 support@shopease.in</p>
              <p className="text-gray-600 mt-2">📞 +91-9988776655</p>
            </div>
          </div>
        </div>
      </section>


      {/* <Footer /> */}
    </div>
  );
}

export default ContactUs;
