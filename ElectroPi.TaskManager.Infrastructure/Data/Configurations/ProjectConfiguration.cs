using ElectroPi.TaskManager.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ElectroPi.TaskManager.Infrastructure.Data.Configurations
{
    public class ProjectConfiguration : IEntityTypeConfiguration<Project>
    {
        public void Configure(EntityTypeBuilder<Project> builder)
        {
            builder.ToTable("Projects");

            builder.HasKey(project => project.Id);

            builder.Property(project => project.Id)
                .ValueGeneratedOnAdd();

            builder.Property(project => project.Name)
                .IsRequired()
                .HasMaxLength(150);

            builder.Property(project => project.Description)
                .HasMaxLength(1000);

            builder.Property(project => project.CreatedAt)
                .IsRequired();
        }
    }
}
