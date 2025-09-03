interface WorkflowStepProps {
  number: string;
  title: string;
  description: string;
}

export function WorkflowStep({ number, title, description }: WorkflowStepProps) {
  return (
    <div className="flex gap-4">
      <div className="bg-[#FDE047] border-2 border-black w-12 h-12 flex items-center justify-center font-black text-xl">
        {number}
      </div>
      <div>
        <h3 className="font-black uppercase tracking-wide mb-2">{title}</h3>
        <p className="text-base leading-relaxed">{description}</p>
      </div>
    </div>
  );
}