import { useState, useEffect } from 'react';
import { X, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface TourStep {
  target: string;
  title: string;
  description: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

interface TourGuideProps {
  steps: TourStep[];
  onComplete: () => void;
  onSkip: () => void;
}

export function TourGuide({ steps, onComplete, onSkip }: TourGuideProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    const element = document.querySelector(steps[currentStep].target);
    if (element) {
      const rect = element.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

      let top = rect.top + scrollTop;
      let left = rect.left + scrollLeft;

      // Ajusta posição baseado na direção
      switch (steps[currentStep].position) {
        case 'bottom':
          top += rect.height + 10;
          left += rect.width / 2;
          break;
        case 'top':
          top -= 10;
          left += rect.width / 2;
          break;
        case 'right':
          top += rect.height / 2;
          left += rect.width + 10;
          break;
        case 'left':
          top += rect.height / 2;
          left -= 10;
          break;
      }

      setPosition({ top, left });

      // Scroll suave até o elemento
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Adiciona highlight ao elemento
      element.classList.add('tour-highlight');
      return () => element.classList.remove('tour-highlight');
    }
  }, [currentStep, steps]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const step = steps[currentStep];

  return (
    <>
      {/* Overlay escuro */}
      <div className="fixed inset-0 bg-black/60 z-[100] animate-in fade-in duration-300" />

      {/* Card do tour */}
      <Card
        className="fixed z-[101] w-80 shadow-2xl animate-in fade-in zoom-in duration-300"
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
          transform: 'translate(-50%, -50%)',
        }}
      >
        <CardContent className="p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                {currentStep + 1}
              </div>
              <span className="text-sm text-muted-foreground">
                de {steps.length}
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={onSkip} className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-2">{step.title}</h3>
            <p className="text-muted-foreground leading-relaxed">{step.description}</p>
          </div>

          <div className="flex items-center justify-between pt-2">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Anterior
            </Button>

            <Button onClick={handleNext} className="gap-2">
              {currentStep === steps.length - 1 ? (
                <>
                  Concluir
                  <CheckCircle2 className="h-4 w-4" />
                </>
              ) : (
                <>
                  Próximo
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>

          <div className="flex gap-1 justify-center pt-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all ${
                  index === currentStep
                    ? 'w-8 bg-primary'
                    : index < currentStep
                    ? 'w-2 bg-primary/50'
                    : 'w-2 bg-muted'
                }`}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
