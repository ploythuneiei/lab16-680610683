import { useMemo, useState } from "react";
import { PlusCircle, X as XIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEnrollmentStore } from "@/lib/enrollment-store";

type Option = { value: string; label: string };

function OptionSelect({
  id,
  options,
  value,
  onChange,
  placeholder,
  disabled,
}: {
  id: string;
  options: Option[];
  value: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <Select
      items={options}
      value={value}
      onValueChange={(v) => onChange(v as string)}
      disabled={disabled}
    >
      <SelectTrigger id={id} className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// ---------- Combobox เลือกนักศึกษาหลายคน (ไม่ creatable — เลือกได้เฉพาะที่มีอยู่) ----------
function StudentMultiField({
  items,
  value,
  onValueChange,
  disabled,
}: {
  items: Option[];
  value: string[];
  onValueChange: (next: string[]) => void;
  disabled?: boolean;
}) {
  const anchor = useComboboxAnchor();
  const available = items.filter((o) => !value.includes(o.value));

  return (
    <Combobox items={available} multiple value={value} onValueChange={onValueChange} disabled={disabled}>
      <ComboboxChips ref={anchor}>
        <ComboboxValue>
          {(vals: string[]) =>
            vals.map((id) => {
              const label = items.find((o) => o.value === id)?.label ?? id;
              return <ComboboxChip key={id}>{label}</ComboboxChip>;
            })
          }
        </ComboboxValue>
        <ComboboxChipsInput
          placeholder={disabled ? "เลือกวิชาก่อน" : "เลือกนักศึกษา"}
        />
      </ComboboxChips>
      <ComboboxContent anchor={anchor}>
        <ComboboxEmpty>ไม่พบนักศึกษา</ComboboxEmpty>
        <ComboboxList>
          {(item: Option) => (
            <ComboboxItem key={item.value} value={item.value}>
              {item.label}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

// ---------- หน้าหลัก ----------
export default function AdminEnrollmentsPage() {
  const { students, courses, enrollStudents, unenrollStudent } =
    useEnrollmentStore();

  const [open, setOpen] = useState(false);
  const [formCourse, setFormCourse] = useState<string | null>(null);
  const [formStudents, setFormStudents] = useState<string[]>([]);

  const [mode, setMode] = useState<"course" | "student">("course");
  const [filterCourse, setFilterCourse] = useState("all");
  const [filterStudent, setFilterStudent] = useState("all");

  const courseOptions: Option[] = courses.map((c) => ({
    value: c.courseCode,
    label: `${c.courseCode} — ${c.courseTitle}`,
  }));
  const studentOptions: Option[] = students.map((s) => ({
    value: s.studentId,
    label: `${s.studentId} — ${s.firstName} ${s.lastName}`,
  }));

  // รายชื่อนักศึกษาที่ "ยังไม่ได้ลง" วิชาที่เลือกไว้ในฟอร์ม — ให้เลือกได้เฉพาะกลุ่มนี้
  const studentItems = useMemo(() => {
    if (!formCourse) return [];
    return students
      .filter((s) => !s.enrolledCourses.includes(formCourse))
      .map((s) => ({
        value: s.studentId,
        label: `${s.studentId} — ${s.firstName} ${s.lastName}`,
      }));
  }, [students, formCourse]);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      setFormCourse(null);
      setFormStudents([]);
    }
  };

  // เปลี่ยนวิชา -> ล้างรายชื่อนักศึกษาที่เลือกไว้เสมอ
  const handleCourseChange = (value: string) => {
    setFormCourse(value);
    setFormStudents([]);
  };

  const handleEnroll = () => {
    if (!formCourse || formStudents.length === 0) return;
    enrollStudents(formCourse, formStudents);
    setOpen(false);
    setFormCourse(null);
    setFormStudents([]);
  };

  // แถวที่จะแสดง = หนึ่งแถวต่อหนึ่งวิชา ตาม filter ที่เลือก
  const rows = courses.filter((c) => {
    if (mode === "course") {
      return filterCourse === "all" || c.courseCode === filterCourse;
    }
    if (filterStudent === "all") return true;
    const student = students.find((s) => s.studentId === filterStudent);
    return student ? student.enrolledCourses.includes(c.courseCode) : false;
  });

  const studentsOf = (courseCode: string) =>
    students.filter((s) => s.enrolledCourses.includes(courseCode));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">จัดการการลงทะเบียน</h1>
        <p className="text-sm text-muted-foreground">
          Admin ลงทะเบียนและยกเลิกการลงทะเบียนให้นักศึกษาได้ทุกคน
        </p>
      </div>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger render={<Button />}>
          <PlusCircle className="h-4 w-4" />
          ลงทะเบียนให้นักศึกษา
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ลงทะเบียนให้นักศึกษา</DialogTitle>
            <DialogDescription>เลือกวิชาก่อน แล้วจึงเลือกนักศึกษาได้</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="formCourse">วิชา</Label>
              <OptionSelect
                id="formCourse"
                options={courseOptions}
                value={formCourse}
                placeholder="เลือกวิชา"
                onChange={handleCourseChange}
              />
            </div>

            <div className="grid gap-1.5">
              <Label>นักศึกษา</Label>
              <StudentMultiField
                items={studentItems}
                value={formStudents}
                onValueChange={setFormStudents}
                disabled={!formCourse}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              disabled={!formCourse || formStudents.length === 0}
              onClick={handleEnroll}
            >
              <PlusCircle className="h-4 w-4" />
              ลงทะเบียน ({formStudents.length} คน)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Tabs value={mode} onValueChange={(v) => setMode(v as "course" | "student")}>
        <TabsList>
          <TabsTrigger value="course">ค้นหาตามวิชา</TabsTrigger>
          <TabsTrigger value="student">ค้นหาตามนักศึกษา</TabsTrigger>
        </TabsList>
        <TabsContent value="course" className="pt-2">
          <OptionSelect
            id="filterCourse"
            options={[{ value: "all", label: "ทุกวิชา" }, ...courseOptions]}
            value={filterCourse}
            onChange={setFilterCourse}
          />
        </TabsContent>
        <TabsContent value="student" className="pt-2">
          <OptionSelect
            id="filterStudent"
            options={[{ value: "all", label: "ทุกคน" }, ...studentOptions]}
            value={filterStudent}
            onChange={setFilterStudent}
          />
        </TabsContent>
      </Tabs>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>รหัสวิชา</TableHead>
              <TableHead>ชื่อวิชา</TableHead>
              <TableHead>จำนวน นศ.</TableHead>
              <TableHead>นักศึกษาที่ลงทะเบียน</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="h-20 text-center text-muted-foreground">
                  ไม่พบข้อมูล
                </TableCell>
              </TableRow>
            )}
            {rows.map((c) => {
              const enrolled = studentsOf(c.courseCode);
              return (
                <TableRow key={c.courseCode}>
                  <TableCell className="font-medium">{c.courseCode}</TableCell>
                  <TableCell>{c.courseTitle}</TableCell>
                  <TableCell>{enrolled.length}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {enrolled.length === 0 ? (
                        <span className="text-sm text-muted-foreground">
                          ยังไม่มีนักศึกษาลงทะเบียน
                        </span>
                      ) : (
                        enrolled.map((s) => (
                          <Badge key={s.studentId} variant="outline" className="gap-1">
                            {s.firstName} {s.lastName}
                            <button
                              type="button"
                              aria-label={`ลบ ${s.firstName} ออกจาก ${c.courseCode}`}
                              onClick={() => unenrollStudent(c.courseCode, s.studentId)}
                            >
                              <XIcon className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}