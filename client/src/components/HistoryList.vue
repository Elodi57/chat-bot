<!-- client/src/components/HistoryList.vue -->
<template>
  <div class="history">
    <div class="header">
      <h3>Historial</h3>
      <button class="new-chat" @click="createChat">+ Nuevo</button>
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
      activeId: null
    }
  },
  methods: {
    selectChat(id) {
      this.activeId = id
      this.$emit('select', id)
    },
    async createChat() {
      const name = prompt('Nombre del nuevo chat:')
      if (!name) return
      try {
        await axios.post('http://localhost:3000/api/chats', { name })
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
  background: #27A2DB;
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
  background: #27A2DB;
  color: white;
}

.name {
  font-weight: 600;
}

.meta {
  font-size: 12px;
  color: #555;
}
</style>

