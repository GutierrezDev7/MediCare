import { Construction, Hammer } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface FeatureUnderDevelopmentProps {
  message?: string;
  className?: string;
}

export function FeatureUnderDevelopment({ 
  message = "Funcionalidade em desenvolvimento", 
  className 
}: FeatureUnderDevelopmentProps) {
  return (
    <Card className={`border-dashed border-2 bg-muted/30 ${className}`}>
      <CardContent className="flex flex-col items-center justify-center py-12 text-center space-y-4">
        <div className="bg-primary/10 p-4 rounded-full">
          <Construction className="h-10 w-10 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">{message}</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Estamos trabalhando para trazer novidades em breve!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
