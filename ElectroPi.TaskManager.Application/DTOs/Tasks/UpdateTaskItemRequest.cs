using System.ComponentModel.DataAnnotations;
using ElectroPi.TaskManager.Application.Validation;
using ElectroPi.TaskManager.Domain.Enums;

namespace ElectroPi.TaskManager.Application.DTOs.Tasks;

public sealed class UpdateTaskItemRequest
{
    [Required]
    [StringLength(200)]
    public string Title { get; set; } = string.Empty;

    [StringLength(2000)]
    public string? Description { get; set; }

    [Required]
    [EnumDataType(typeof(TaskItemStatus))]
    public TaskItemStatus? Status { get; set; }

    [NotDefaultDate]
    public DateTime DueDate { get; set; }

    [Range(1, int.MaxValue)]
    public int ProjectId { get; set; }
}
