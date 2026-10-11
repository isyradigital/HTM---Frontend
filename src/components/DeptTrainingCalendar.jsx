/**
 * @deprecated Use `UniversalTrainingCalendar` with mode="dept" instead.
 * This file is kept for backward compatibility.
 * 
 * Old usage:  <DeptTrainingCalendar department="ICU" />
 * New usage:  <UniversalTrainingCalendar mode="dept" department="ICU" />
 */
"use client";
import { UniversalTrainingCalendar } from "@/components/UniversalTrainingCalendar";

export function DeptTrainingCalendar({ department }) {
  return <UniversalTrainingCalendar mode="dept" department={department} />;
}
