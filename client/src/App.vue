<template>
  <div class="app">
    <header class="header">
      <div class="brand">
        <img src="./assets/weather.png" alt="AI icon" class="logo" />
        <div class="text">
          <h1>ClimaBot</h1>
          <small>Asistente de pronóstico en Argentina</small>
        </div>
      </div>
      <div class="status">
        <span :class="connected ? 'dot on' : 'dot off'"></span>
        <small>{{ connected ? 'Conectado' : 'Desconectado' }}</small>
      </div>
    </header>

    <div class="container">
      <aside class="left">
        <HistoryList
          :chats="chats"
          @select="selectChat"
          @refresh="loadChats"
        />
      </aside>

      <main class="main">
        <!-- ✅ Chat con scroll independiente -->
        <ChatView
          v-if="currentChatId"
          :chatId="currentChatId"
          :key="currentChatId"
          class="chat-scroll"
        />
      </main>

      <aside class="right">
        <SuggestedQuestions @send="sendSuggested" />
      </aside>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import socket from './services/socket';
import HistoryList from './components/HistoryList.vue';
import ChatView from './components/ChatView.vue';
import SuggestedQuestions from './components/SuggestedQuestions.vue';

export default {
  components: { HistoryList, ChatView, SuggestedQuestions },
  setup() {
    const chats = ref([]);
    const currentChatId = ref(null);
    const connected = ref(false);

    async function loadChats() {
      try {
        const res = await axios.get('http://localhost:3000/api/chats');
        chats.value = res.data;
        if (!currentChatId.value && res.data.length > 0) {
          currentChatId.value = res.data[0].id;
        }
      } catch (err) {
        console.error('Error cargando chats:', err);
      }
    }

    function selectChat(id) {
      currentChatId.value = id;
    }

    function sendSuggested(text) {
      window.dispatchEvent(
        new CustomEvent('send_suggested', {
          detail: { chatId: currentChatId.value, text }
        })
      );
    }

    onMounted(() => {
      loadChats();

      connected.value = socket.connected;
      socket.on('connect', () => (connected.value = true));
      socket.on('disconnect', () => (connected.value = false));
    });

    return { chats, currentChatId, selectChat, sendSuggested, connected, loadChats };
  }
};
</script>

<style scoped>
.app {
  font-family: 'Inter', Arial, sans-serif;
  height: 100vh; /* ocupa toda la pantalla */
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #fafdff, #f3f6fb);
  color: #0b1530;
  overflow: hidden; /* ✅ sin scroll global */
}

/* HEADER */
.header {
  background: linear-gradient(90deg, #27A2DB, #1a8ac4);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 24px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.12);
  border-bottom: 3px solid #FCD462;
  flex-shrink: 0;
}
.logo {
  width: 48px;
  height: 48px;
  margin-right: 12px;
}
.brand {
  display: flex;
  align-items: center;
  gap: 10px;
}
.brand h1 {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
}
.brand small {
  display: block;
  font-size: 13px;
  opacity: 0.85;
}

.status {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}
.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-block;
}
.dot.on {
  background: #4ade80;
  box-shadow: 0 0 6px #4ade80;
}
.dot.off {
  background: #ef4444;
  box-shadow: 0 0 6px #ef4444;
}

/* CONTENEDOR PRINCIPAL */
.container {
  flex: 1;
  display: grid;
  grid-template-columns: 260px 1fr 280px;
  gap: 16px;
  padding: 16px;
  overflow: hidden; /* ✅ el contenido no se desplaza globalmente */
}

/* PANELES */
.left,
.main,
.right {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
  padding: 12px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  overflow: hidden; /* evita scrolls individuales */
}
.left:hover,
.main:hover,
.right:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 14px rgba(0, 0, 0, 0.1);
}

/* ✅ SCROLL SOLO EN EL CHAT */
.chat-scroll {
  flex: 1;
  height: 100%;
  overflow-y: auto;
}

/* SCROLL PERSONALIZADO */
::-webkit-scrollbar {
  width: 8px;
}
::-webkit-scrollbar-thumb {
  background: #27A2DB;
  border-radius: 6px;
}
::-webkit-scrollbar-thumb:hover {
  background: #1a8ac4;
}
</style>
