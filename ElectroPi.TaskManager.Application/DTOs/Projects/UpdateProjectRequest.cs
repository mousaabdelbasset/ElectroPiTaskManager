using System.ComponentModel.DataAnnotations;

namespace ElectroPi.TaskManager.Application.DTOs.Projects;

public sealed class UpdateProjectRequest
{
    [Required]
    [StringLength(150)]
    public string Name { get; set; } = string.Empty;

    [StringLength(1000)]
    public string? Description { get; set; }
}
