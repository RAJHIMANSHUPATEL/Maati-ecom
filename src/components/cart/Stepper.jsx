export default function Stepper({ currentStep, steps }) {
  return (
    <div className="flex items-center justify-between mb-6">
      {steps.map((step, index) => {
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;

        return (
          <div key={step} className="flex-1 flex items-center">
            <div
              className={`
                flex items-center justify-center w-10 h-10 rounded-full text-white font-bold
                ${
                  isCompleted
                    ? "bg-green-500"
                    : isActive
                    ? "bg-blue-500"
                    : "bg-gray-300"
                }
              `}
            >
              {index + 1}
            </div>
            <div className="ml-2 mr-4">
              <p
                className={`font-medium ${
                  isActive
                    ? "text-blue-600"
                    : isCompleted
                    ? "text-green-600"
                    : "text-gray-500"
                }`}
              >
                {step}
              </p>
            </div>
            {index < steps.length - 1 && (
              <div className="flex-1 h-1 bg-gray-300 relative">
                <div
                  className={`absolute top-0 left-0 h-1 ${
                    isCompleted ? "bg-green-500 w-full" : "bg-gray-300 w-full"
                  }`}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
