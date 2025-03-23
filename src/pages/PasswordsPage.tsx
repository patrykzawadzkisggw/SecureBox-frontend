import { DataTable } from "@/components/DataTable";
import PageTemplate from "./PageTemplate";

export default function PasswordsPage() {
  return (
    <PageTemplate title="Manager haseł">
      <div className="flex justify-center">
        <div className="flex flex-1 flex-col gap-4 px-4 py-10 max-w-4xl">
          <h1 className="text-3xl font-bold tracking-tight select-none">Hasła</h1>
          <DataTable />
        </div>
      </div>
    </PageTemplate>
  );
}