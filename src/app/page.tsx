"use client";

import Link from "next/link";
import { Button } from "@/components/Button";
import { useEffect, useState } from "react";

interface Course {
  id: string;
  name: string;
  type: string;
  totalDays: number;
  price: number;
  description: string;
}

interface Stats {
  totalStudents: number;
  successRate: number;
  completedStudents?: number;
}

export default function Home() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [stats, setStats] = useState<Stats>({ totalStudents: 0, successRate: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch courses
        const coursesRes = await fetch("/api/courses");
        if (coursesRes.ok) {
          const coursesData = await coursesRes.json();
          setCourses(coursesData);
        }

        // Fetch stats
        const statsRes = await fetch("/api/admin/stats");
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        // Fallback to default data
        setCourses([
          { id: "1", name: "Basic Driving", type: "BASIC", totalDays: 30, price: 5000, description: "Perfect for beginners." },
          { id: "2", name: "Advanced Driving", type: "ADVANCED", totalDays: 50, price: 10000, description: "Master advanced techniques." },
          { id: "3", name: "Defense Driving", type: "DEFENSE", totalDays: 90, price: 7500, description: "Learn defensive driving." },
        ]);
        setStats({ totalStudents: 0, successRate: 0 });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#E91E63] rounded-lg flex items-center justify-center">
              <span className="font-bold text-white text-lg">R</span>
            </div>
            <span className="font-bold text-gray-900 text-lg">Rose Royal</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-gray-700 hover:text-[#E91E63] font-medium">
              Login
            </Link>
            <Link href="/register">
              <Button size="sm">Register</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#E91E63] to-[#C2185B] text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl sm:text-6xl font-bold mb-6">
            Learn Driving with Confidence
          </h1>
          <p className="text-xl mb-8 text-pink-100">
            Rose Royal Driving School – Your trusted partner for professional driving education
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="tel:+919876543210" className="inline-flex items-center justify-center gap-2 bg-white text-[#E91E63] px-8 py-4 rounded-lg font-bold hover:bg-gray-100 transition">
              📞 Call Now
            </a>
            <a
              href="https://wa.me/919876543210?text=I%20am%20interested%20in%20driving%20lessons"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-green-500 text-white px-8 py-4 rounded-lg font-bold hover:bg-green-600 transition"
            >
              💬 WhatsApp
            </a>
            <Link href="/register">
              <Button className="px-8 py-4 text-lg bg-white text-[#E91E63] hover:bg-gray-100">
                📝 Register Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            Why Choose Rose Royal?
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-lg text-center">
              <div className="text-5xl mb-4">👨‍🏫</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Expert Instructors</h3>
              <p className="text-gray-700">Certified and experienced driving professionals</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg text-center">
              <div className="text-5xl mb-4">📅</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Flexible Timing</h3>
              <p className="text-gray-700">Classes available morning, afternoon, and evening</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg text-center">
              <div className="text-5xl mb-4">🚗</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Modern Fleet</h3>
              <p className="text-gray-700">Well-maintained vehicles for safe learning</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg text-center">
              <div className="text-5xl mb-4">✅</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">High Pass Rate</h3>
              <p className="text-gray-700">{stats.successRate}% student success rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* Course Packages */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            Our Course Packages
          </h2>
          {loading ? (
            <div className="text-center text-gray-600">Loading courses...</div>
          ) : courses.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-8">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition"
                >
                  <div className="bg-gradient-to-r from-[#E91E63] to-[#C2185B] text-white p-6">
                    <h3 className="text-2xl font-bold mb-2">{course.name}</h3>
                    <p className="text-pink-100">{course.type}</p>
                  </div>
                  <div className="p-6">
                    <div className="mb-6">
                      <p className="text-gray-700 text-sm mb-2">Duration</p>
                      <p className="text-3xl font-bold text-[#E91E63]">{course.totalDays}</p>
                      <p className="text-gray-700 text-sm">days</p>
                    </div>
                    <p className="text-gray-700 mb-6">{course.description}</p>
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700 mb-1">Price</p>
                      <p className="text-2xl font-bold text-gray-900">₹{course.price.toLocaleString('en-IN')}</p>
                    </div>
                    <Link href="/register">
                      <Button className="w-full">Enroll Now</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-600">No courses available</div>
          )}
        </div>
      </section>

      {/* Success Rate */}
      <section className="bg-[#E91E63] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-12">Our Track Record</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <p className="text-6xl font-bold mb-2">{stats.successRate}%</p>
              <p className="text-xl">Student Success Rate</p>
            </div>
            <div>
              <p className="text-6xl font-bold mb-2">{stats.totalStudents}+</p>
              <p className="text-xl">Students Trained</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-8">About Us</h2>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-gray-700 text-lg mb-4">
                Rose Royal Driving School is dedicated to providing comprehensive driving education to students of all skill levels. With over a decade of experience, we have trained thousands of students to become confident and responsible drivers.
              </p>
              <p className="text-gray-700 text-lg mb-4">
                Our mission is to ensure that every student receives the best training with certified instructors and modern vehicles, making driving education accessible and affordable.
              </p>
              <p className="text-gray-700 text-lg">
                We believe in building safe drivers for a safer road environment.
              </p>
            </div>
            <div className="bg-gradient-to-br from-[#E91E63] to-[#C2185B] rounded-xl h-64 flex items-center justify-center text-white text-center">
              <div>
                <p className="text-6xl mb-4">🎓</p>
                <p className="text-2xl font-bold">Professional Training</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">Contact Us</h2>
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">📞 Phone</h3>
                  <a href="tel:+919876543210" className="text-[#E91E63] hover:underline text-lg">
                    +91 98765 43210
                  </a>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">📧 Email</h3>
                  <a href="mailto:info@roseroyaldriving.com" className="text-[#E91E63] hover:underline text-lg">
                    info@roseroyaldriving.com
                  </a>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">📍 Address</h3>
                  <p className="text-gray-700">123 Driving Lane, City Center, State 12345, India</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3930.0!2d78.050529!3d9.9346316!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b00cec250cf531f%3A0x5d558bec87c933a8!2sRose%20Royal%20Driving%20School!5e0!3m2!1sen!2sin!4v1709654321000"
                width="100%"
                height="300"
                style={{ border: 0, borderRadius: "8px" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
              <a
                href="https://www.google.com/maps/place/Rose+Royal+Driving+School/@9.9346316,78.050529,17z"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-4 text-[#E91E63] hover:underline font-medium"
              >
                📍 View on Google Maps
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2026 Rose Royal Driving School. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
