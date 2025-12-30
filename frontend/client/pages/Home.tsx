import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  AlertCircle,
  Users,
  BookOpen,
  Clock,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 lg:px-12 py-4 md:py-6 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <BookOpen className="w-7 h-7 text-primary" />
          <h1 className="text-2xl font-bold text-slate-900">CampusHub</h1>
        </div>
        <div className="flex gap-3">
          <Link to="/login">
            <Button
              variant="ghost"
              className="text-slate-700 hover:text-slate-900"
            >
              Login
            </Button>
          </Link>
          <Link to="/signup">
            <Button className="bg-primary hover:bg-primary/90">Sign Up</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 lg:px-12 py-16 md:py-24 text-center">
        <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
            Smart Resource Management for
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary ml-2">
              Modern Campuses
            </span>
          </h2>
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto">
            Streamline classroom scheduling, equipment allocation, and faculty
            availability with our intelligent campus resource optimizer. Save
            time, eliminate conflicts, and maximize efficiency.
          </p>
          <div className="flex justify-center pt-4">
            <Link to="/signup">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-white shadow-lg px-8 py-3 text-lg"
              >
                Get Started Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="px-6 lg:px-12 py-16 md:py-24 bg-white/50">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-3xl md:text-4xl font-bold text-slate-900 text-center mb-12">
            The Challenge
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-lg bg-red-50 border border-red-200">
              <AlertCircle className="w-8 h-8 text-red-600 mb-4" />
              <h4 className="font-semibold text-slate-900 mb-2">
                Scheduling Conflicts
              </h4>
              <p className="text-slate-600 text-sm">
                Double-bookings, overlapping reservations, and manual conflict
                resolution causing administrative chaos.
              </p>
            </div>
            <div className="p-6 rounded-lg bg-orange-50 border border-orange-200">
              <Users className="w-8 h-8 text-orange-600 mb-4" />
              <h4 className="font-semibold text-slate-900 mb-2">
                Poor Utilization
              </h4>
              <p className="text-slate-600 text-sm">
                Resources sitting idle while users can't find available slots.
                No visibility into actual usage patterns.
              </p>
            </div>
            <div className="p-6 rounded-lg bg-yellow-50 border border-yellow-200">
              <Clock className="w-8 h-8 text-yellow-600 mb-4" />
              <h4 className="font-semibold text-slate-900 mb-2">
                Manual Management
              </h4>
              <p className="text-slate-600 text-sm">
                Paper-based systems and spreadsheets creating bottlenecks and
                frequent human errors.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="px-6 lg:px-12 py-16 md:py-24">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-3xl md:text-4xl font-bold text-slate-900 text-center mb-12">
            Our Solution
          </h3>
          <div className="space-y-4">
            <div className="flex gap-4 items-start p-5 rounded-lg hover:bg-slate-50 transition-colors">
              <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-slate-900 mb-1">
                  Real-Time Conflict Detection
                </h4>
                <p className="text-slate-600">
                  Intelligent algorithms prevent double-bookings instantly,
                  ensuring zero scheduling conflicts.
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start p-5 rounded-lg hover:bg-slate-50 transition-colors">
              <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-slate-900 mb-1">
                  Smart Resource Allocation
                </h4>
                <p className="text-slate-600">
                  Manage classrooms, equipment, books, and faculty hours in one
                  unified platform with role-based access.
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start p-5 rounded-lg hover:bg-slate-50 transition-colors">
              <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-slate-900 mb-1">
                  Utilization Analytics
                </h4>
                <p className="text-slate-600">
                  Beautiful dashboards and reports showing peak hours, idle
                  resources, and optimization opportunities.
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start p-5 rounded-lg hover:bg-slate-50 transition-colors">
              <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-slate-900 mb-1">
                  Automatic Notifications
                </h4>
                <p className="text-slate-600">
                  Email confirmations for every booking, keeping all
                  stakeholders informed in real-time.
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start p-5 rounded-lg hover:bg-slate-50 transition-colors">
              <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-slate-900 mb-1">
                  Mobile-First Design
                </h4>
                <p className="text-slate-600">
                  Access resources and make bookings on-the-go with our
                  responsive, modern interface.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 lg:px-12 py-16 md:py-20 text-center bg-gradient-to-br from-blue-50 to-slate-50">
        <div className="max-w-2xl mx-auto space-y-6">
          <h3 className="text-3xl md:text-4xl font-bold text-slate-900">
            Ready to Transform Your Campus?
          </h3>
          <p className="text-lg text-slate-600">
            Join institutions already using CampusHub to streamline their
            resource management.
          </p>
          <div className="flex justify-center">
            <Link to="/signup">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-white shadow-lg px-8 py-3 text-lg"
              >
                Sign Up for Free
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50 py-8 px-6 lg:px-12">
        <div className="max-w-4xl mx-auto text-center text-slate-600 text-sm">
          <p>
            © 2024 CampusHub. Built for educational institutions. All rights
            reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
