import { Card } from "@/components/ui/card";
import { Submission, Question } from "@/types/question";

interface QuestionSubmissionsProps {
  submissions: Submission[];
  question: Question;
}

export default function QuestionSubmissions({ submissions, question }: QuestionSubmissionsProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'text-green-600 bg-green-100';
      case 'error': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'timeout': return 'text-orange-600 bg-orange-100';
      case 'compilation_error': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'accepted': return 'Aceita';
      case 'error': return 'Erro';
      case 'pending': return 'Pendente';
      case 'timeout': return 'Tempo Excedido';
      case 'compilation_error': return 'Erro de Compilação';
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Submissões</h2>
        
        {submissions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">Nenhuma submissão encontrada.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {submissions.map((submission) => (
              <div key={submission.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-medium">#{submission.attempt}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(submission.status)}`}>
                      {getStatusLabel(submission.status)}
                    </span>
                    <span className="text-sm text-gray-600">{submission.language}</span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>{formatDate(submission.submittedAt)}</span>
                    <span className="font-medium">{submission.score}/{question.points} pts</span>
                  </div>
                </div>

                {submission.feedback && (
                  <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                    {submission.feedback}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}






















