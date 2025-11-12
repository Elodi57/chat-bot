<template>
  <div class="history">
    <div class="header">
      <h3>Historial</h3>
      <button class="new-chat" @click="openModal">+ Nuevo</button>
    </div>

    <ul>
      <li
        v-for="c in chats"
        :key="c.id"
        @click="selectChat(c.id)"
        :class="{ active: c.id === activeId }"
      >
        <div class="name">{{ c.name }}</div>
        <div class="meta">{{ formatDate(c.created_at) }}</div>
      </li>
    </ul>
  </div>

  <!-- MODAL GLOBAL -->
  <teleport to="body">
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <h3>Nuevo Chat</h3>
        <input
          v-model="newChatName"
          type="text"
          placeholder="Escribí un nombre..."
          @keyup.enter="createChat"
        />
        <div class="actions">
          <button class="cancel" @click="closeModal">Cancelar</button>
          <button class="confirm" @click="createChat">Crear</button>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script>
import axios from 'axios'

export default {
  emits: ['select', 'refresh'],
  props: {
    chats: { type: Array, required: true }
  },
  data() {
    return {
      activeId: null,
      showModal: false,
      newChatName: ''
    }
  },
  methods: {
    selectChat(id) {
      this.activeId = id
      this.$emit('select', id)
    },
    openModal() {
      this.newChatName = ''
      this.showModal = true
      document.body.classList.add('blurred-bg')
    },
    closeModal() {
      this.showModal = false
      document.body.classList.remove('blurred-bg')
    },
    async createChat() {
      const name = this.newChatName.trim()
      if (!name) return
      try {
        await axios.post('http://localhost:3000/api/chats', { name })
        this.closeModal()
        this.$emit('refresh')
      } catch (err) {
        console.error('Error creando chat:', err)
      }
    },
    formatDate(date) {
      if (!date) return ''
      return new Date(date).toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit'
      })
    }
  }
}
</script>

<style scoped>
.history {
  flex: 1;
  background: #f9fcff;
  padding: 12px;
  display: flex;
  flex-direction: column;
  border-radius: 10px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.new-chat {
  background: #27a2db;
  color: #fff;
  border: none;
  padding: 6px 10px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}
.new-chat:hover {
  background: #1d8ec1;
}

.history h3 {
  margin: 0;
  color: #0b1530;
}

.history ul {
  list-style: none;
  padding: 0;
  margin: 0;
  flex: 1;
  overflow-y: auto;
}

.history li {
  padding: 10px;
  border-bottom: 1px solid #e9f1f7;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.history li:hover {
  background: #eaf7ff;
}

.history li.active {
  background: #27a2db;
  color: white;
}

.name {
  font-weight: 600;
}

.meta {
  font-size: 12px;
  color: #555;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(11, 21, 48, 0.45);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;

  /* 🔥 Aplica desenfoque al fondo, NO al modal */
  backdrop-filter: blur(6px);
}

/* Modal centrado y sin desenfoque */
.modal {
  background: #ffffff;
  padding: 24px 28px;
  border-radius: 12px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.15);
  width: 300px;
  text-align: center;
  animation: fadeIn 0.25s ease;
  z-index: 2100;
}

.modal h3 {
  margin-bottom: 12px;
  color: #0b1530;
}

.modal input {
  width: 100%;
  padding: 8px 10px;
  margin-bottom: 16px;
  border: 1px solid #cfd8e3;
  border-radius: 6px;
  font-size: 14px;
}

.actions {
  display: flex;
  justify-content: space-between;
}

.cancel,
.confirm {
  flex: 1;
  padding: 8px 0;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  transition: 0.2s;
}

.cancel {
  background: #e5e7eb;
  margin-right: 6px;
}

.cancel:hover {
  background: #d1d5db;
}

.confirm {
  background: #27a2db;
  color: white;
}

.confirm:hover {
  background: #1d8ec1;
}

/* 💫 Animación suave */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.96);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>

