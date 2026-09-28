import { useMemo, useState } from "react";
import { PlusCircle, Trash2, X as XIcon } from "lucide-react";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useEnrollmentStore } from "@/lib/enrollment-store";

// ---------- Combobox เลือก/พิมพ์เพิ่มผู้สอน (multiple + creatable) ----------
type InstructorOption = { value: string; label: string };

function InstructorField({
    allInstructors,
    value,
    onValueChange,
}: {
    allInstructors: string[];
    value: string[];
    onValueChange: (next: string[]) => void;
}) {
    const [inputValue, setInputValue] = useState("");
    const anchor = useComboboxAnchor();

    const trimmed = inputValue.trim();
    const lower = trimmed.toLowerCase();

    // รวมชื่อที่มีอยู่แล้วในทุกวิชา + ชื่อที่เลือกไว้ใน Dialog นี้
    // (ชื่อใหม่ที่เพิ่งพิมพ์เพิ่ม ยังไม่ถูกบันทึกลง store จึงต้องดึงจาก value ด้วย)
    const pool = Array.from(new Set([...allInstructors, ...value]));

    const alreadyExists = pool.some((name) => name.toLowerCase() === lower);

    // กรองตามข้อความที่พิมพ์ แต่ "ไม่" ตัดชื่อที่เลือกแล้วออก จะได้เห็นเครื่องหมายถูก
    const options: InstructorOption[] = pool
        .filter((name) => name.toLowerCase().includes(lower))
        .map((name) => ({ value: name, label: name }));

    // แถว "+ เพิ่มผู้สอน" โผล่เฉพาะตอนพิมพ์ชื่อที่ยังไม่มีใน pool เลย
    const items: InstructorOption[] =
        trimmed !== "" && !alreadyExists
            ? [...options, { value: trimmed, label: `+ เพิ่มผู้สอน "${trimmed}"` }]
            : options;

    return (
        <Combobox
            items={items}
            multiple
            filter={null}
            value={value}
            onValueChange={(next: string[]) => {
                onValueChange(next);
                setInputValue("");
            }}
            inputValue={inputValue}
            onInputValueChange={setInputValue}
        >
            <ComboboxChips ref={anchor}>
                <ComboboxValue>
                    {(vals: string[]) =>
                        vals.map((name) => <ComboboxChip key={name}>{name}</ComboboxChip>)
                    }
                </ComboboxValue>
                <ComboboxChipsInput
                    className="min-w-8!"
                    placeholder={value.length === 0 ? "เลือกหรือพิมพ์ชื่อผู้สอน (ได้หลายคน)" : ""}
                />
            </ComboboxChips>
            <ComboboxContent anchor={anchor}>
                <ComboboxEmpty>ไม่พบชื่อผู้สอน</ComboboxEmpty>
                <ComboboxList>
                    {(item: InstructorOption) => (
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
type FormState = { courseCode: string; courseTitle: string; instructors: string[] };
const emptyForm: FormState = { courseCode: "", courseTitle: "", instructors: [] };

export default function AdminCoursesPage() {
    const { courses, addCourse, removeCourse, removeInstructor } =
        useEnrollmentStore();

    const [open, setOpen] = useState(false);
    const [form, setForm] = useState<FormState>(emptyForm);

    const allInstructors = useMemo(() => {
        const set = new Set<string>();
        courses.forEach((c) => c.instructors?.forEach((name) => set.add(name)));
        return Array.from(set).sort();
    }, [courses]);

    const trimmedCode = form.courseCode.trim();
    const isDuplicate =
        trimmedCode !== "" &&
        courses.some((c) => c.courseCode.toLowerCase() === trimmedCode.toLowerCase());

    const canSave = trimmedCode !== "" && form.courseTitle.trim() !== "" && !isDuplicate;

    const handleOpenChange = (next: boolean) => {
        setOpen(next);
        if (!next) setForm(emptyForm);
    };

    const handleSave = () => {
        if (!canSave) return;
        addCourse({
            courseCode: trimmedCode.toUpperCase(),
            courseTitle: form.courseTitle.trim(),
            instructors: form.instructors,
        });
        setOpen(false);
        setForm(emptyForm);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-semibold">จัดการวิชาเรียน</h1>
                    <p className="text-sm text-muted-foreground">
                        {courses.length} วิชา — เพิ่มวิชาใหม่ที่นี่แล้วจะไปโผล่เป็นตัวเลือก ตอนลงทะเบียนให้นักศึกษาที่หน้า "จัดการการลงทะเบียน" ทันที
                    </p>
                </div>

                <Dialog open={open} onOpenChange={handleOpenChange}>
                    <DialogTrigger render={<Button />}>
                        <PlusCircle className="h-4 w-4" />
                        เพิ่มวิชา
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>เพิ่มวิชาใหม่</DialogTitle>
                            <DialogDescription>
                                วิชาที่เพิ่มจะไปโผล่เป็นตัวเลือกตอนลงทะเบียนให้นักศึกษาได้ทันที
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-4">
                            <div className="grid gap-1.5">
                                <Label htmlFor="courseCode">รหัสวิชา</Label>
                                <Input
                                    id="courseCode"
                                    value={form.courseCode}
                                    aria-invalid={isDuplicate}
                                    className={isDuplicate ? "border-destructive" : undefined}
                                    onChange={(e) =>
                                        setForm((f) => ({ ...f, courseCode: e.target.value }))
                                    }
                                    placeholder="เช่น CPE303"
                                />
                                {isDuplicate && (
                                    <p className="text-sm text-destructive">
                                        มีรหัสวิชา {trimmedCode.toUpperCase()} นี้แล้ว
                                    </p>
                                )}
                            </div>

                            <div className="grid gap-1.5">
                                <Label htmlFor="courseTitle">ชื่อวิชา</Label>
                                <Input
                                    id="courseTitle"
                                    value={form.courseTitle}
                                    onChange={(e) =>
                                        setForm((f) => ({ ...f, courseTitle: e.target.value }))
                                    }
                                    placeholder="เช่น Mobile Application Development"
                                />
                            </div>

                            <div className="grid gap-1.5">
                                <Label>ผู้สอน</Label>
                                <InstructorField
                                    allInstructors={allInstructors}
                                    value={form.instructors}
                                    onValueChange={(instructors) =>
                                        setForm((f) => ({ ...f, instructors }))
                                    }
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button disabled={!canSave} onClick={handleSave}>
                                บันทึก
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="rounded-lg border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>รหัสวิชา</TableHead>
                            <TableHead>ชื่อวิชา</TableHead>
                            <TableHead>ผู้สอน</TableHead>
                            <TableHead className="w-16">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {courses.map((c) => (
                            <TableRow key={c.courseCode}>
                                <TableCell>{c.courseCode}</TableCell>
                                <TableCell>{c.courseTitle}</TableCell>
                                <TableCell>
                                    <div className="flex flex-wrap gap-1">
                                        {c.instructors && c.instructors.length > 0 ? (
                                            c.instructors.map((name) => (
                                                <Badge
                                                    key={name}
                                                    variant="outline"
                                                    className="gap-1 border-blue-300! bg-blue-100! text-blue-700! dark:border-blue-400/40! dark:bg-blue-500/20! dark:text-blue-300!"
                                                >
                                                    {name}
                                                    <button
                                                        type="button"
                                                        aria-label={`ลบผู้สอน ${name}`}
                                                        onClick={() => removeInstructor(c.courseCode, name)}
                                                    >
                                                        <XIcon className="h-3 w-3" />
                                                    </button>
                                                </Badge>
                                            ))
                                        ) : (
                                            <span className="text-sm text-muted-foreground">
                                                ยังไม่มีผู้สอน
                                            </span>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <AlertDialog>
                                        <AlertDialogTrigger render={<Button variant="ghost" size="icon-sm" />}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>ลบวิชา?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    ลบ {c.courseCode} — {c.courseTitle} ออกจากรายวิชาที่เปิดสอน
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                                                <AlertDialogAction
                                                    variant="destructive"
                                                    onClick={() => removeCourse(c.courseCode)}
                                                >
                                                    ยืนยัน
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}