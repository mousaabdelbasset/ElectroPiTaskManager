using ElectroPi.TaskManager.Domain.Enums;

namespace ElectroPi.TaskManager.Domain.Entities
{
    public class TaskItem
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public TaskItemStatus Status { get; set; } = TaskItemStatus.ToDo;
        public DateTime DueDate { get; set; }
        public int ProjectId { get; set; }
        public Project Project { get; set; } = null!;
    }
}
