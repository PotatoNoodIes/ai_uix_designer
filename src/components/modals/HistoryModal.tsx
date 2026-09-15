import type { Project } from "@/types";
import { Modal, Micro } from "@/components/primitives";
import { cn } from "@/utils/cn";

interface HistoryModalProps {
  projects: Project[];
  currentProject: Project | null;
  onClose: () => void;
  onSelectProject: (p: Project) => void;
}

export function HistoryModal({
  projects,
  currentProject,
  onClose,
  onSelectProject,
}: HistoryModalProps) {
  return (
    <Modal title="Workspace history" onClose={onClose} className="max-w-2xl">
      {projects.length === 0 ? (
        <div className="py-20 text-center flex flex-col items-center gap-3">
          <Micro as="p">Nothing here yet</Micro>
          <p className="text-subtle max-w-[32ch]">
            Projects you generate are saved to this browser and show up here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {projects.map((p) => {
            const isCurrent = currentProject?.id === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onSelectProject(p)}
                aria-current={isCurrent ? "true" : undefined}
                className={cn(
                  "p-5 flex flex-col gap-2.5 text-left border transition-colors duration-fast",
                  "bg-sunken hover:border-acid",
                  isCurrent ? "border-acid" : "border-hairline"
                )}
              >
                <Micro className={isCurrent ? "text-acid" : undefined}>
                  {p.data.architecture || "Web/App"}
                </Micro>
                <h4 className="font-display font-extrabold text-body truncate text-ink">
                  {p.name}
                </h4>
                <div className="flex items-center justify-between w-full">
                  <Micro>{new Date(p.timestamp).toLocaleDateString()}</Micro>
                  <Micro>
                    {new Date(p.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Micro>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </Modal>
  );
}
