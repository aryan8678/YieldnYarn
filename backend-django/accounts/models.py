from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager
from django.contrib.auth.models import PermissionsMixin
from django.db import models


class UserManager(BaseUserManager):
    """Manager for the custom email-based User model."""

    use_in_migrations = True

    def _create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Users must have an email address")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)
        extra_fields.setdefault("role", User.Role.BUYER)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("role", User.Role.ADMIN)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True")

        return self._create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """Custom user model, per implementation_plan.md §3.1 `users` table."""

    class Role(models.TextChoices):
        SELLER = "SELLER", "Seller"
        BUYER = "BUYER", "Buyer"
        ADMIN = "ADMIN", "Admin"
        VERIFIER = "VERIFIER", "Verifier"

    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True, default="")
    role = models.CharField(
        max_length=20, choices=Role.choices, default=Role.BUYER
    )
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    class Meta:
        db_table = "users"

    def __str__(self):
        return f"{self.email} ({self.role})"

    @property
    def is_seller(self):
        return self.role == self.Role.SELLER

    @property
    def is_buyer(self):
        return self.role == self.Role.BUYER

    @property
    def is_admin_role(self):
        return self.role == self.Role.ADMIN

    @property
    def is_verifier(self):
        return self.role == self.Role.VERIFIER


class UserProfile(models.Model):
    """Extended profile info, per implementation_plan.md `user_profiles` table.

    Location is stored as plain lat/lng float pairs rather than a PostGIS
    Point field, per the simplicity tradeoff noted in the task instructions.
    """

    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name="profile"
    )
    display_name = models.CharField(max_length=150, blank=True, default="")
    avatar_url = models.URLField(blank=True, default="")
    preferred_language = models.CharField(
        max_length=10, blank=True, default="en"
    )
    location_lat = models.FloatField(null=True, blank=True)
    location_lng = models.FloatField(null=True, blank=True)

    class Meta:
        db_table = "user_profiles"

    def __str__(self):
        return f"Profile<{self.user.email}>"
