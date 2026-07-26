using System.ComponentModel.DataAnnotations;
using ElectroPi.TaskManager.Domain.Enums;

namespace ElectroPi.TaskManager.Application.DTOs.Tasks;

public sealed class UpdateTaskStatusRequest
{
    [Required]
    [EnumDataType(typeof(TaskItemStatus))]
    public TaskItemStatus? Status { get; set; }
}
