<script setup lang="ts">
defineProps<{ id: string }>()
</script>

<template>
  <!-- Cà Phê Đen - ly cà phê đen -->
  <svg v-if="id === 'cafe-den'" viewBox="0 0 64 64" class="w-12 h-12">
    <rect x="14" y="18" width="30" height="32" rx="4" fill="#4E342E"/>
    <rect x="18" y="22" width="22" height="8" rx="2" fill="#3E2723"/>
    <path d="M44 26 c6 0 10 4 10 10s-4 10-10 10" stroke="#4E342E" stroke-width="3.5" fill="none" stroke-linecap="round"/>
    <rect x="12" y="50" width="34" height="4" rx="2" fill="#5D4037"/>
    <path d="M22 12 c0-4 2-6 4-8" stroke="#8D6E63" stroke-width="2" fill="none" stroke-linecap="round"/>
    <path d="M29 12 c0-4 2-6 4-8" stroke="#8D6E63" stroke-width="2" fill="none" stroke-linecap="round"/>
    <path d="M36 12 c0-4 2-6 4-8" stroke="#8D6E63" stroke-width="2" fill="none" stroke-linecap="round"/>
  </svg>

  <!-- Cà Phê Sữa - ly cà phê sữa 2 lớp -->
  <svg v-else-if="id === 'cafe-sua'" viewBox="0 0 64 64" class="w-12 h-12">
    <rect x="14" y="18" width="30" height="32" rx="4" fill="#FFECB3"/>
    <rect x="14" y="18" width="30" height="16" rx="4" fill="#6D4C41"/>
    <rect x="14" y="30" width="30" height="4" fill="#D7CCC8"/>
    <path d="M44 26 c6 0 10 4 10 10s-4 10-10 10" stroke="#A1887F" stroke-width="3.5" fill="none" stroke-linecap="round"/>
    <rect x="12" y="50" width="34" height="4" rx="2" fill="#8D6E63"/>
    <path d="M22 12 c0-4 2-6 4-8" stroke="#A1887F" stroke-width="2" fill="none" stroke-linecap="round"/>
    <path d="M29 12 c0-4 2-6 4-8" stroke="#A1887F" stroke-width="2" fill="none" stroke-linecap="round"/>
    <path d="M36 12 c0-4 2-6 4-8" stroke="#A1887F" stroke-width="2" fill="none" stroke-linecap="round"/>
  </svg>

  <!-- Nước Ngọt - lon nước ngọt -->
  <svg v-else-if="id === 'nuoc-ngot'" viewBox="0 0 64 64" class="w-12 h-12">
    <rect x="18" y="14" width="28" height="42" rx="6" fill="#E53935"/>
    <rect x="18" y="14" width="28" height="8" rx="6" fill="#B71C1C"/>
    <rect x="22" y="30" width="20" height="10" rx="2" fill="#FFCDD2"/>
    <rect x="28" y="8" width="8" height="8" rx="2" fill="#BDBDBD"/>
    <path d="M30 8 L34 4 L36 8" fill="#9E9E9E"/>
  </svg>

  <!-- Nước Cam - quả cam + ly -->
  <svg v-else-if="id === 'nuoc-cam'" viewBox="0 0 64 64" class="w-12 h-12">
    <circle cx="32" cy="34" r="18" fill="#FF9800"/>
    <circle cx="32" cy="34" r="14" fill="#FFB74D"/>
    <line x1="32" y1="20" x2="32" y2="48" stroke="#FF9800" stroke-width="1.5"/>
    <line x1="18" y1="34" x2="46" y2="34" stroke="#FF9800" stroke-width="1.5"/>
    <line x1="22" y1="24" x2="42" y2="44" stroke="#FF9800" stroke-width="1.5"/>
    <line x1="42" y1="24" x2="22" y2="44" stroke="#FF9800" stroke-width="1.5"/>
    <circle cx="32" cy="34" r="4" fill="#FF9800"/>
    <path d="M30 16 c0-4 2-6 6-6" stroke="#4CAF50" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <ellipse cx="38" cy="11" rx="5" ry="3" fill="#66BB6A"/>
  </svg>

  <!-- Nước Dừa - trái dừa -->
  <svg v-else-if="id === 'nuoc-dua'" viewBox="0 0 64 64" class="w-12 h-12">
    <ellipse cx="32" cy="38" rx="20" ry="18" fill="#795548"/>
    <ellipse cx="32" cy="36" rx="16" ry="14" fill="#8D6E63"/>
    <circle cx="26" cy="34" r="3" fill="#5D4037"/>
    <circle cx="38" cy="34" r="3" fill="#5D4037"/>
    <circle cx="32" cy="40" r="2.5" fill="#5D4037"/>
    <ellipse cx="32" cy="22" rx="12" ry="6" fill="#A5D6A7"/>
    <path d="M32 16 L28 8" stroke="#66BB6A" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <path d="M32 16 L36 8" stroke="#66BB6A" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <path d="M32 16 L32 6" stroke="#66BB6A" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  </svg>

  <!-- Trà Tắc - ly trà đá chanh -->
  <svg v-else-if="id === 'tra-tac'" viewBox="0 0 64 64" class="w-12 h-12">
    <path d="M16 16 L20 52 L44 52 L48 16 Z" fill="#FFF9C4"/>
    <path d="M16 16 L20 52 L44 52 L48 16 Z" fill="none" stroke="#F9A825" stroke-width="2.5"/>
    <rect x="20" y="36" width="24" height="16" rx="2" fill="#FFEE58" opacity="0.5"/>
    <circle cx="28" cy="42" r="6" fill="#FDD835"/>
    <circle cx="28" cy="42" r="4" fill="#FFEE58"/>
    <circle cx="36" cy="36" r="5" fill="#FDD835"/>
    <circle cx="36" cy="36" r="3" fill="#FFEE58"/>
    <rect x="14" y="14" width="36" height="4" rx="2" fill="#F9A825"/>
    <line x1="30" y1="14" x2="28" y2="6" stroke="#F9A825" stroke-width="2" stroke-linecap="round"/>
    <line x1="28" y1="6" x2="24" y2="2" stroke="#F9A825" stroke-width="2" stroke-linecap="round"/>
  </svg>

  <!-- Rau Má - ly rau má xanh -->
  <svg v-else-if="id === 'rau-ma'" viewBox="0 0 64 64" class="w-12 h-12">
    <path d="M16 16 L20 52 L44 52 L48 16 Z" fill="#C8E6C9"/>
    <path d="M16 16 L20 52 L44 52 L48 16 Z" fill="none" stroke="#43A047" stroke-width="2.5"/>
    <rect x="20" y="28" width="24" height="24" rx="2" fill="#66BB6A" opacity="0.4"/>
    <rect x="14" y="14" width="36" height="4" rx="2" fill="#43A047"/>
    <path d="M28 10 Q24 4 20 6" stroke="#2E7D32" stroke-width="2" fill="none" stroke-linecap="round"/>
    <path d="M28 10 Q32 2 36 6" stroke="#2E7D32" stroke-width="2" fill="none" stroke-linecap="round"/>
    <ellipse cx="24" cy="6" rx="4" ry="3" fill="#4CAF50"/>
    <ellipse cx="34" cy="5" rx="4" ry="3" fill="#4CAF50"/>
  </svg>

  <!-- Nước Mía - ly nước mía -->
  <svg v-else-if="id === 'nuoc-mia'" viewBox="0 0 64 64" class="w-12 h-12">
    <path d="M16 16 L20 52 L44 52 L48 16 Z" fill="#FFF8E1"/>
    <path d="M16 16 L20 52 L44 52 L48 16 Z" fill="none" stroke="#F9A825" stroke-width="2.5"/>
    <rect x="20" y="28" width="24" height="24" rx="2" fill="#FFD54F" opacity="0.5"/>
    <rect x="14" y="14" width="36" height="4" rx="2" fill="#F9A825"/>
    <!-- Cây mía -->
    <rect x="34" y="2" width="4" height="18" rx="2" fill="#8BC34A"/>
    <line x1="34" y1="8" x2="38" y2="8" stroke="#689F38" stroke-width="1.5"/>
    <line x1="34" y1="13" x2="38" y2="13" stroke="#689F38" stroke-width="1.5"/>
    <path d="M36 2 L32 -2" stroke="#7CB342" stroke-width="2" fill="none" stroke-linecap="round"/>
    <path d="M36 2 L40 -2" stroke="#7CB342" stroke-width="2" fill="none" stroke-linecap="round"/>
  </svg>

  <!-- Fallback -->
  <span v-else class="text-4xl">{{ id }}</span>
</template>
