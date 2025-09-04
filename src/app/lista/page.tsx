import { mockLists } from "../../mocks/list";
import { Button } from "../../components/ui/button";
import NavBar from "../../components/NavBar";

export default function ListaPage() {
  // Usuário autenticado mock para NavBar
  const user = { id: "1", avatar: "/profile-default.svg" };
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <NavBar user={user} />
      <div className="flex flex-1 flex-col items-center justify-center p-4">
        <div className="bg-secondary rounded-2xl shadow-xl p-8 w-full max-w-2xl flex flex-col items-center gap-6">
          <h1 className="text-3xl font-bold text-primary mb-2">Lista de Exercícios</h1>
          <ul className="list-disc pl-5 space-y-4 w-full text-left">
            {mockLists.map(list => (
              <li key={list.id} className="mb-2">
                <a href={`/lista/${list.id}`} className="text-primary hover:underline font-semibold text-lg">{list.title}</a>
                <div className="text-gray-500 text-sm">{list.description}</div>
                <span className="text-xs text-gray-400">{list.questions.length} questões</span>
              </li>
            ))}
          </ul>
          <a href="/home" className="w-full mt-4">
            <Button className="w-full" variant="outline">Voltar para Home</Button>
          </a>
        </div>
      </div>
    </div>
  );
}
