using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RunningTracker.API.Models
{
    public class RunningActivity
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public DateTime Date { get; set; }

        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "Distance must be greater than 0")]
        public double Distance { get; set; } // in kilometers
        
        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "Duration must be greater than 0")]
        public int Duration { get; set; } // in seconds
        
        [StringLength(500)]
        public string? Notes { get; set; }
        
        public string? WeatherConditions { get; set; }
        
        public double? Temperature { get; set; } // in Celsius
        
        // Foreign keys
        public int? UserId { get; set; }
        public int? RouteId { get; set; }

        [Required]
        public DateTime CreatedAt { get; set; }
        
        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        public User? User { get; set; }
        public RunningRoute? Route { get; set; }

        // Calculated properties (not stored in DB)
        [NotMapped]
        public double? Pace => Duration > 0 ? Distance > 0 ? Duration / 60.0 / Distance : null : null; // minutes per kilometer

        [NotMapped]
        public double? Speed => Duration > 0 ? Distance / (Duration / 3600.0) : null; // kilometers per hour
    }
} 