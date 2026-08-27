export default function Stepper({ currentStep, steps }) {
  return (
    <div className="mb-6 flex items-center justify-between gap-1">
      {steps.map((step, index) => {
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;

        return (
          <div key={step} className="flex min-w-0 flex-1 items-center">
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center text-xs font-semibold text-white sm:h-10 sm:w-10 sm:text-sm ${
                isCompleted ? "bg-chilli" : isActive ? "bg-ink" : "bg-rule"
              }`}
            >
              {index + 1}
            </div>
            <p
              className={`ml-1.5 mr-2 hidden truncate text-xs font-medium sm:block sm:text-sm ${
                isActive ? "text-ink" : isCompleted ? "text-chilli" : "text-ink/40"
              }`}
            >
              {step}
            </p>
            {index < steps.length - 1 && (
              <div className="h-px min-w-4 flex-1 bg-rule">
                <div className={`h-px ${isCompleted ? "w-full bg-chilli" : "w-0"}`} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
