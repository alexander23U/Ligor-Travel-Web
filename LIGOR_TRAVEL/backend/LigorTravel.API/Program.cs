using System.Text;
using LigorTravel.API.Data;
using LigorTravel.API.Hubs;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// =====================================================
// CONTROLADORES
// =====================================================

builder.Services.AddControllers();

// =====================================================
// BASE DE DATOS POSTGRESQL
// =====================================================

var connectionString =
builder.Configuration.GetConnectionString("DefaultConnection");

if (string.IsNullOrWhiteSpace(connectionString))
{
throw new InvalidOperationException(
"No se encontró la cadena de conexión 'DefaultConnection'.");
}

builder.Services.AddDbContext<AppDbContext>(options =>
{
options.UseNpgsql(connectionString);
});

// =====================================================
// CORS PARA EL FRONTEND CON LIVE SERVER
// =====================================================

builder.Services.AddCors(options =>
{
options.AddPolicy("PermitirFrontend", policy =>
{
policy
.WithOrigins(
"http://127.0.0.1:5500",
"http://localhost:5500",
"http://127.0.0.1:5501",
"http://localhost:5501"
)
.AllowAnyHeader()
.AllowAnyMethod()
.AllowCredentials();
});
});

// =====================================================
// JWT
// =====================================================

var jwtSettings = builder.Configuration.GetSection("Jwt");

var jwtKey = jwtSettings["Key"];
var jwtIssuer = jwtSettings["Issuer"];
var jwtAudience = jwtSettings["Audience"];

if (string.IsNullOrWhiteSpace(jwtKey))
{
throw new InvalidOperationException(
"No se encontró la configuración Jwt:Key.");
}

if (string.IsNullOrWhiteSpace(jwtIssuer))
{
throw new InvalidOperationException(
"No se encontró la configuración Jwt:Issuer.");
}

if (string.IsNullOrWhiteSpace(jwtAudience))
{
throw new InvalidOperationException(
"No se encontró la configuración Jwt:Audience.");
}

// =====================================================
// AUTENTICACIÓN JWT
// =====================================================

builder.Services
.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
.AddJwtBearer(options =>
{
options.TokenValidationParameters = new TokenValidationParameters
{
ValidateIssuerSigningKey = true,
IssuerSigningKey = new SymmetricSecurityKey(
Encoding.UTF8.GetBytes(jwtKey)
),

        ValidateIssuer = true,
        ValidIssuer = jwtIssuer,

        ValidateAudience = true,
        ValidAudience = jwtAudience,

        ValidateLifetime = true,

        ClockSkew = TimeSpan.FromMinutes(1)
    };

    // Permite utilizar JWT también desde SignalR.
    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var accessToken =
                context.Request.Query["access_token"];

            var path =
                context.HttpContext.Request.Path;

            if (
                !string.IsNullOrWhiteSpace(accessToken) &&
                path.StartsWithSegments("/chatHub")
            )
            {
                context.Token = accessToken;
            }

            return Task.CompletedTask;
        }
    };
});

// =====================================================
// AUTORIZACIÓN
// =====================================================

builder.Services.AddAuthorization();

// =====================================================
// SIGNALR
// =====================================================

builder.Services.AddSignalR();

// =====================================================
// SWAGGER CON JWT
// =====================================================

builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(options =>
{
options.AddSecurityDefinition(
"Bearer",
new OpenApiSecurityScheme
{
Name = "Authorization",
Type = SecuritySchemeType.Http,
Scheme = "bearer",
BearerFormat = "JWT",
In = ParameterLocation.Header,
Description =
"Introduce únicamente el token JWT."
});

options.AddSecurityRequirement(
    new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });

});

var app = builder.Build();

// =====================================================
// SWAGGER
// =====================================================

if (app.Environment.IsDevelopment())
{
app.UseSwagger();
app.UseSwaggerUI();
}

// =====================================================
// ARCHIVOS ESTÁTICOS
// Permite acceder a wwwroot/uploads/imagen.jpg
// =====================================================

app.UseStaticFiles();

// Mientras trabajas únicamente con HTTP, déjalo comentado.
// En producción deberás utilizar HTTPS.
// app.UseHttpsRedirection();

// =====================================================
// ORDEN DEL MIDDLEWARE
// =====================================================

app.UseCors("PermitirFrontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.MapHub<ChatHub>("/chatHub");

app.Run();
