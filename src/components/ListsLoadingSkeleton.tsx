import { Card } from "@/components/ui/card";

export default function ListsLoadingSkeleton() {
  return (
    <div className="space-y-4">
      {/* Estatísticas skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-4">
            <div className="animate-pulse">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-5 h-5 bg-gray-300 rounded"></div>
                <div className="h-4 bg-gray-300 rounded w-24"></div>
              </div>
              <div className="h-8 bg-gray-300 rounded w-16"></div>
            </div>
          </Card>
        ))}
      </div>

      {/* Filtros skeleton */}
      <Card className="p-4 mb-6">
        <div className="animate-pulse">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="h-10 bg-gray-300 rounded"></div>
            </div>
            <div className="flex gap-4">
              <div className="h-10 bg-gray-300 rounded w-40"></div>
              <div className="h-10 bg-gray-300 rounded w-40"></div>
            </div>
          </div>
        </div>
      </Card>

      {/* Listas skeleton */}
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-6">
            <div className="animate-pulse">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-4 h-4 bg-gray-300 rounded"></div>
                    <div className="h-6 bg-gray-300 rounded w-48"></div>
                  </div>
                  <div className="h-4 bg-gray-300 rounded w-96 mb-3"></div>
                  <div className="flex items-center gap-6 mb-3">
                    <div className="h-4 bg-gray-300 rounded w-20"></div>
                    <div className="h-4 bg-gray-300 rounded w-24"></div>
                    <div className="h-4 bg-gray-300 rounded w-32"></div>
                  </div>
                  <div className="h-3 bg-gray-300 rounded w-64"></div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-6 bg-gray-300 rounded w-20"></div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
