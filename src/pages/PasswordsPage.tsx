import { DataTable } from "@/components/DataTable";
import PageTemplate from "./PageTemplate";
import { usePasswordContext } from "@/data/PasswordContext";

export default function PasswordsPage() {
  const {state,addPassword, copyToClipboard,setMasterkey,updatePassword,deletePassword} = usePasswordContext();
  return (
    <PageTemplate title="Manager haseł">
      <div className="flex justify-center">
        <div className="flex flex-1 flex-col gap-4 px-4 py-10 max-w-4xl">
          <h1 className="text-3xl font-bold tracking-tight select-none">Hasła</h1>
          <DataTable passwords={state.passwords} loading={state.loading} addPassword={addPassword } copyToClipboard={copyToClipboard} setMasterkey={setMasterkey} updatePassword={updatePassword} deletePassword={deletePassword} state={state} />
        </div>
      </div>
    </PageTemplate>
  );
}