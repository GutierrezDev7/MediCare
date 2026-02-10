import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { X, MessageCircle, Phone, FileText } from 'lucide-react';

interface HelpAssistantProps {
  onClose: () => void;
}

export function HelpAssistant({ onClose }: HelpAssistantProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-10 fade-in">
      <Card className="w-80 shadow-2xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Precisa de ajuda?</CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>
            Estamos aqui para ajudar você a usar o aplicativo.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button variant="outline" className="w-full justify-start gap-2">
            <MessageCircle className="h-4 w-4" />
            Chat com Suporte
          </Button>
          <Button variant="outline" className="w-full justify-start gap-2">
            <Phone className="h-4 w-4" />
            Ligar para Emergência
          </Button>
          <Button variant="outline" className="w-full justify-start gap-2">
            <FileText className="h-4 w-4" />
            Ver Tutoriais
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
