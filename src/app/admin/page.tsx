"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SCHOOLS } from "@/lib/constants";
import { Download, Search, Mail, Eye, Image as ImageIcon, Unlock } from "lucide-react";
import { toast } from "sonner";

// Mock data for MVP
const MOCK_DATA = [
  { id: "1", name: "Alice Sharma", enrollment: "26ESCS01", email: "alice@jecrc.ac.in", school: "engineering", program: "B.Tech Computer Science", year: 2030, date: "2026-07-08", status: "locked", hasImage: true },
  { id: "2", name: "Rahul Verma", enrollment: "26ESMB02", email: "rahul@jecrc.ac.in", school: "business", program: "MBA", year: 2028, date: "2026-07-08", status: "locked", hasImage: false },
  { id: "3", name: "Priya Singh", enrollment: "26ESDS03", email: "priya@jecrc.ac.in", school: "design", program: "B.Des", year: 2030, date: "2026-07-07", status: "locked", hasImage: true },
];

export default function AdminDashboard() {
  const [search, setSearch] = useState("");
  const [filterSchool, setFilterSchool] = useState("all");
  const [filterYear, setFilterYear] = useState("all");

  const handleExport = () => {
    toast.success("Exporting data as CSV...");
  };

  const handleTriggerEmail = (id: string) => {
    toast.success(`Resent delivery email for capsule #${id}`);
  };
  
  const handleUnlock = (id: string) => {
    toast.success(`Manual unlock triggered for capsule #${id}`);
  };
  
  const handleImagePreview = (id: string) => {
    toast.success(`Previewing image for capsule #${id}`);
  };

  const filteredData = MOCK_DATA.filter((item) => {
    const matchesSearch = item.enrollment.toLowerCase().includes(search.toLowerCase()) || item.email.toLowerCase().includes(search.toLowerCase());
    const matchesSchool = filterSchool === "all" || item.school === filterSchool;
    const matchesYear = filterYear === "all" || item.year.toString() === filterYear;
    return matchesSearch && matchesSchool && matchesYear;
  });

  return (
    <div className="flex-1 flex flex-col p-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="font-serif text-[#1A1A1A]">Time Capsule Admin</h1>
          <p className="text-zinc-500 mt-1">Manage locked capsules and trigger deliveries.</p>
        </div>
        <Button onClick={handleExport} className="bg-primary text-white hover:bg-primary/90 shadow-sm rounded-full px-6">
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <Input 
            placeholder="Search enrollment or email..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white border-zinc-200 text-zinc-900 h-10 shadow-sm focus-visible:ring-primary/20 focus-visible:border-primary rounded-xl"
          />
        </div>
        
        <Select value={filterSchool} onValueChange={(val) => setFilterSchool(val || "all")}>
          <SelectTrigger className="bg-white border-zinc-200 text-zinc-900 h-10 shadow-sm focus-visible:ring-primary/20 focus-visible:border-primary rounded-xl">
            <SelectValue placeholder="All Schools" />
          </SelectTrigger>
          <SelectContent className="bg-white border-zinc-200 text-zinc-900 rounded-xl">
            <SelectItem value="all" className="focus:bg-zinc-100 cursor-pointer">All Schools</SelectItem>
            {SCHOOLS.map((s) => (
              <SelectItem key={s.id} value={s.id} className="focus:bg-zinc-100 cursor-pointer">{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterYear} onValueChange={(val) => setFilterYear(val || "all")}>
          <SelectTrigger className="bg-white border-zinc-200 text-zinc-900 h-10 shadow-sm focus-visible:ring-primary/20 focus-visible:border-primary rounded-xl">
            <SelectValue placeholder="Graduation Year" />
          </SelectTrigger>
          <SelectContent className="bg-white border-zinc-200 text-zinc-900 rounded-xl">
            <SelectItem value="all" className="focus:bg-zinc-100 cursor-pointer">All Years</SelectItem>
            <SelectItem value="2027" className="focus:bg-zinc-100 cursor-pointer">2027</SelectItem>
            <SelectItem value="2028" className="focus:bg-zinc-100 cursor-pointer">2028</SelectItem>
            <SelectItem value="2029" className="focus:bg-zinc-100 cursor-pointer">2029</SelectItem>
            <SelectItem value="2030" className="focus:bg-zinc-100 cursor-pointer">2030</SelectItem>
            <SelectItem value="2031" className="focus:bg-zinc-100 cursor-pointer">2031</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 border-b border-zinc-200">
              <tr>
                <th className="px-6 py-4 font-medium tracking-wider">Student Info</th>
                <th className="px-6 py-4 font-medium tracking-wider">Program</th>
                <th className="px-6 py-4 font-medium tracking-wider">Grad Year</th>
                <th className="px-6 py-4 font-medium tracking-wider">Status</th>
                <th className="px-6 py-4 font-medium tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredData.map((item) => (
                <tr key={item.id} className="hover:bg-zinc-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-zinc-900">{item.enrollment}</div>
                    <div className="text-zinc-500">{item.email}</div>
                  </td>
                  <td className="px-6 py-4 text-zinc-700">
                    <div>{item.program}</div>
                    <div className="text-xs text-zinc-500">{SCHOOLS.find(s => s.id === item.school)?.name}</div>
                  </td>
                  <td className="px-6 py-4 text-zinc-700">{item.year}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-600 border border-amber-200">
                      {item.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-1">
                      {item.hasImage && (
                        <Button variant="ghost" size="icon" onClick={() => handleImagePreview(item.id)} className="h-8 w-8 text-zinc-400 hover:text-primary hover:bg-primary/5" title="Image Preview">
                          <ImageIcon className="w-4 h-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100" title="View details">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleUnlock(item.id)} className="h-8 w-8 text-zinc-400 hover:text-amber-500 hover:bg-amber-50" title="Manual Unlock">
                        <Unlock className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleTriggerEmail(item.id)} className="h-8 w-8 text-zinc-400 hover:text-emerald-500 hover:bg-emerald-50" title="Resend Email">
                        <Mail className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                    No capsules found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
