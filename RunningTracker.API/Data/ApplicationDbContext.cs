using Microsoft.EntityFrameworkCore;
using RunningTracker.API.Models;

namespace RunningTracker.API.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<RunningActivity> RunningActivities { get; set; }
        public DbSet<RunningRoute> Routes { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure relationships
            modelBuilder.Entity<RunningActivity>()
                .HasOne(a => a.User)
                .WithMany(u => u.RunningActivities)
                .HasForeignKey(a => a.UserId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<RunningActivity>()
                .HasOne(a => a.Route)
                .WithMany(r => r.RunningActivities)
                .HasForeignKey(a => a.RouteId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<RunningRoute>()
                .HasOne(r => r.User)
                .WithMany(u => u.Routes)
                .HasForeignKey(r => r.UserId)
                .OnDelete(DeleteBehavior.SetNull);
        }

        public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            // Update timestamps for modified entities
            var userEntries = ChangeTracker
                .Entries<User>()
                .Where(e => e.State == EntityState.Added || e.State == EntityState.Modified);

            foreach (var entityEntry in userEntries)
            {
                if (entityEntry.State == EntityState.Added)
                {
                    entityEntry.Entity.CreatedAt = DateTime.UtcNow;
                }
                else
                {
                    entityEntry.Entity.UpdatedAt = DateTime.UtcNow;
                }
            }

            var activityEntries = ChangeTracker
                .Entries<RunningActivity>()
                .Where(e => e.State == EntityState.Added || e.State == EntityState.Modified);

            foreach (var entityEntry in activityEntries)
            {
                if (entityEntry.State == EntityState.Added)
                {
                    entityEntry.Entity.CreatedAt = DateTime.UtcNow;
                }
                else
                {
                    entityEntry.Entity.UpdatedAt = DateTime.UtcNow;
                }
            }

            var routeEntries = ChangeTracker
                .Entries<RunningRoute>()
                .Where(e => e.State == EntityState.Added || e.State == EntityState.Modified);

            foreach (var entityEntry in routeEntries)
            {
                if (entityEntry.State == EntityState.Added)
                {
                    entityEntry.Entity.CreatedAt = DateTime.UtcNow;
                }
                else
                {
                    entityEntry.Entity.UpdatedAt = DateTime.UtcNow;
                }
            }

            return base.SaveChangesAsync(cancellationToken);
        }
    }
} 