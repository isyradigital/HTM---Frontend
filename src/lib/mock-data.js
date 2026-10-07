export const patientsData = [
  { id: "P-1001", name: "Sarah Jenkins", age: 34, gender: "Female", phone: "+91 98765 43210", status: "Active", department: "Cardiology", lastVisit: "28 Sep 2026" },
  { id: "P-1002", name: "Michael Chang", age: 45, gender: "Male", phone: "+91 87654 32109", status: "Admitted", department: "Neurology", lastVisit: "27 Sep 2026" },
  { id: "P-1003", name: "Emma Watson", age: 28, gender: "Female", phone: "+91 76543 21098", status: "Active", department: "Pediatrics", lastVisit: "26 Sep 2026" },
  { id: "P-1004", name: "James Wilson", age: 52, gender: "Male", phone: "+91 65432 10987", status: "Discharged", department: "Orthopedics", lastVisit: "25 Sep 2026" },
  { id: "P-1005", name: "Priya Sharma", age: 39, gender: "Female", phone: "+91 54321 09876", status: "Active", department: "Dermatology", lastVisit: "24 Sep 2026" },
  { id: "P-1006", name: "Rahul Verma", age: 61, gender: "Male", phone: "+91 43210 98765", status: "Admitted", department: "Cardiology", lastVisit: "23 Sep 2026" },
];

export const doctorsData = [
  { name: "Dr. Rajesh Kumar", specialization: "Cardiologist", experience: "15 years", rating: 4.9, patients: 1240, available: true, phone: "+91 98765 00001", email: "rajesh@careflow.com" },
  { name: "Dr. Anita Desai", specialization: "Neurologist", experience: "12 years", rating: 4.8, patients: 980, available: true, phone: "+91 98765 00002", email: "anita@careflow.com" },
  { name: "Dr. Robert Clark", specialization: "Pediatrician", experience: "10 years", rating: 4.7, patients: 1560, available: false, phone: "+91 98765 00003", email: "robert@careflow.com" },
  { name: "Dr. Meera Patel", specialization: "Dermatologist", experience: "8 years", rating: 4.9, patients: 870, available: true, phone: "+91 98765 00004", email: "meera@careflow.com" },
  { name: "Dr. Vikram Singh", specialization: "Orthopedic Surgeon", experience: "20 years", rating: 4.6, patients: 2100, available: true, phone: "+91 98765 00005", email: "vikram@careflow.com" },
  { name: "Dr. Sarah Lee", specialization: "Oncologist", experience: "14 years", rating: 4.8, patients: 690, available: false, phone: "+91 98765 00006", email: "sarah@careflow.com" },
];

export const departmentsData = [
  { name: "Cardiology", head: "Dr. Rajesh Kumar", beds: 48, occupied: 32, staff: 24, color: "from-rose-500 to-pink-500", icon: "❤️" },
  { name: "Neurology", head: "Dr. Anita Desai", beds: 36, occupied: 28, staff: 18, color: "from-violet-500 to-purple-500", icon: "🧠" },
  { name: "Pediatrics", head: "Dr. Robert Clark", beds: 54, occupied: 38, staff: 30, color: "from-sky-500 to-blue-500", icon: "👶" },
  { name: "Orthopedics", head: "Dr. Vikram Singh", beds: 42, occupied: 35, staff: 20, color: "from-emerald-500 to-teal-500", icon: "🦴" },
  { name: "Dermatology", head: "Dr. Meera Patel", beds: 20, occupied: 12, staff: 10, color: "from-amber-500 to-orange-500", icon: "🩺" },
  { name: "Oncology", head: "Dr. Sarah Lee", beds: 30, occupied: 26, staff: 22, color: "from-cyan-500 to-blue-500", icon: "🔬" },
  { name: "Emergency", head: "Dr. Arjun Nair", beds: 60, occupied: 45, staff: 35, color: "from-red-500 to-rose-500", icon: "🚑" },
  { name: "General Medicine", head: "Dr. Sunita Rao", beds: 80, occupied: 55, staff: 40, color: "from-indigo-500 to-violet-500", icon: "💊" },
];

export const appointmentsData = [
  { patient: "Sarah Jenkins", doctor: "Dr. Rajesh Kumar", department: "Cardiology", date: "28 Sep 2026", time: "10:00 AM", status: "Confirmed", type: "Follow-up" },
  { patient: "Michael Chang", doctor: "Dr. Anita Desai", department: "Neurology", date: "28 Sep 2026", time: "11:30 AM", status: "Confirmed", type: "New Visit" },
  { patient: "Emma Watson", doctor: "Dr. Robert Clark", department: "Pediatrics", date: "28 Sep 2026", time: "01:15 PM", status: "Pending", type: "Consultation" },
  { patient: "James Wilson", doctor: "Dr. Vikram Singh", department: "Orthopedics", date: "28 Sep 2026", time: "03:45 PM", status: "Confirmed", type: "Surgery Prep" },
  { patient: "Priya Sharma", doctor: "Dr. Meera Patel", department: "Dermatology", date: "29 Sep 2026", time: "09:00 AM", status: "Pending", type: "New Visit" },
  { patient: "Rahul Verma", doctor: "Dr. Rajesh Kumar", department: "Cardiology", date: "29 Sep 2026", time: "10:30 AM", status: "Cancelled", type: "Follow-up" },
];

export const prescriptionsData = [
  { patient: "Sarah Jenkins", medication: "Atorvastatin 20mg", dosage: "1 tablet daily", duration: "30 days", date: "28 Sep 2026", status: "Active" },
  { patient: "Michael Chang", medication: "Levetiracetam 500mg", dosage: "2 tablets daily", duration: "60 days", date: "27 Sep 2026", status: "Active" },
  { patient: "James Wilson", medication: "Ibuprofen 400mg", dosage: "3 times daily", duration: "7 days", date: "25 Sep 2026", status: "Completed" },
  { patient: "Priya Sharma", medication: "Amoxicillin 500mg", dosage: "3 times daily", duration: "10 days", date: "24 Sep 2026", status: "Active" },
  { patient: "Rahul Verma", medication: "Metoprolol 50mg", dosage: "1 tablet daily", duration: "90 days", date: "23 Sep 2026", status: "Active" },
];

export const billsData = [
  { id: "INV-2401", patient: "Sarah Jenkins", amount: 15000, date: "28 Sep 2026", department: "Cardiology", status: "Paid", method: "UPI" },
  { id: "INV-2402", patient: "Michael Chang", amount: 45000, date: "27 Sep 2026", department: "Neurology", status: "Pending", method: "-" },
  { id: "INV-2403", patient: "Emma Watson", amount: 8500, date: "26 Sep 2026", department: "Pediatrics", status: "Paid", method: "Card" },
  { id: "INV-2404", patient: "James Wilson", amount: 120000, date: "25 Sep 2026", department: "Orthopedics", status: "Partial", method: "Cash" },
  { id: "INV-2405", patient: "Priya Sharma", amount: 3200, date: "24 Sep 2026", department: "Dermatology", status: "Paid", method: "UPI" },
];
