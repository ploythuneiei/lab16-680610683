type AppFooterProps = {
    firstName: string,
    lastName: string,
    studentId: string,
}

export function AppFooter({
    firstName,
    lastName,
    studentId
}: AppFooterProps) {
    return (
        <footer className="border-t p-4 text-center text-xs text-muted-foreground">
            จัดทำโดย {firstName} {lastName} — รหัสนักศึกษา {studentId}
        </footer>
    );
}