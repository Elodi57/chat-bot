<!-- client/src/components/ChatView.vue -->
<template>
  <div class="chat-view">
    <!-- Área del chat con scroll -->
    <div class="chat-scroll">
      <div class="messages" ref="messagesEl">
        <div
          v-for="m in messages"
          :key="m.id"
          :class="['msg', m.sender === 'user' ? 'user' : 'bot']"
        >
          <div class="bubble">
            <div class="text" v-html="formatText(m.text)"></div>
            <div class="meta">{{ formatTime(m.created_at) }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Input -->
    <div class="composer">
      <input
        v-model="text"
        @keyup.enter="send"
        placeholder='Ej: "¿Cómo está el tiempo en Buenos Aires?"'
      />
      <button @click="send">Enviar</button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from "vue";
import socket from "../services/socket";

export default {
  props: {
    chatId: { type: Number, required: true },
  },
  setup(props) {
    const messages = ref([]);
    const text = ref("");
    const messagesEl = ref(null);

    // Scroll suave hacia abajo
    function scrollBottom() {
      nextTick(() => {
        if (messagesEl.value) {
          messagesEl.value.scrollTo({
            top: messagesEl.value.scrollHeight,
            behavior: "smooth",
          });
        }
      });
    }

    function joinAndLoad() {
      socket.emit("join_chat", { chatId: props.chatId, chatName: `Chat_${props.chatId}` });
    }

    function onHistory(data) {
      if (!data || !data.messages) return;
      messages.value = data.messages.map((m) => ({
        id: m.id,
        sender: m.sender,
        text: m.text,
        created_at: m.created_at,
      }));
      scrollBottom();
    }

    function onBotMessage({ chatId: c, text: t }) {
      if (parseInt(c) !== parseInt(props.chatId)) return;
      messages.value.push({
        id: Date.now() + Math.random(),
        sender: "bot",
        text: t,
        created_at: new Date().toISOString(),
      });
      scrollBottom();
    }

    function send() {
      if (!text.value.trim()) return;
      const payload = { chatId: props.chatId, text: text.value.trim() };
      messages.value.push({
        id: Date.now(),
        sender: "user",
        text: text.value.trim(),
        created_at: new Date().toISOString(),
      });
      socket.emit("user_message", payload);
      text.value = "";
      scrollBottom();
    }

    function handleSuggested(e) {
      const d = e.detail;
      if (d.chatId === props.chatId) {
        text.value = d.text;
        setTimeout(() => send(), 200);
      }
    }

    function formatText(t) {
      return (t || "").replace(/\n/g, "<br>");
    }

    function formatTime(ts) {
      try {
        return new Date(ts).toLocaleString("es-AR");
      } catch {
        return "";
      }
    }

    function cleanupSocket() {
      socket.removeAllListeners("history");
      socket.removeAllListeners("bot_message");
    }

    onMounted(() => {
      cleanupSocket();
      joinAndLoad();

      socket.on("history", onHistory);
      socket.on("bot_message", onBotMessage);

      window.addEventListener("send_suggested", handleSuggested);
    });

    onBeforeUnmount(() => {
      cleanupSocket();
      window.removeEventListener("send_suggested", handleSuggested);
    });

    watch(
      () => props.chatId,
      () => {
        cleanupSocket();
        messages.value = [];
        joinAndLoad();
        socket.on("history", onHistory);
        socket.on("bot_message", onBotMessage);
      }
    );

    return { messages, text, send, messagesEl, formatText, formatTime };
  },
};
</script>

<style scoped>
.chat-view {
  display: flex;
  flex-direction: column;
  height: 100vh; /* Toda la pantalla */
  background: linear-gradient(180deg, #ffffff, #f5fbff);
  border-radius: 10px;
}

/* Contenedor que tiene el scroll */
.chat-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 14px;
}

/* Área donde se renderizan los mensajes */
.messages {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.msg {
  display: flex;
}
.msg .bubble {
  max-width: 75%;
  padding: 12px;
  border-radius: 12px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
}

.msg.user {
  justify-content: flex-end;
}
.msg.user .bubble {
  background: #27a2db;
  color: #fff;
  border-bottom-right-radius: 4px;
  text-align: right;
}

.msg.bot {
  justify-content: flex-start;
}
.msg.bot .bubble {
  background: #fcd462;
  color: #0b1530;
  border-bottom-left-radius: 4px;
  text-align: left;
}

.meta {
  font-size: 11px;
  color: #555;
  margin-top: 6px;
}

.composer {
  display: flex;
  gap: 8px;
  padding: 10px;
  border-top: 2px solid #eaf1f7;
  background: #ffffff;
  border-radius: 0 0 10px 10px;
  position: sticky;
  bottom: 0;
}

input {
  flex: 1;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #dfe7f2;
  outline: none;
  transition: 0.2s;
}
input:focus {
  border-color: #27a2db;
  box-shadow: 0 0 4px rgba(39, 162, 219, 0.3);
}

button {
  padding: 10px 16px;
  border-radius: 8px;
  background: #27a2db;
  color: white;
  border: none;
  cursor: pointer;
  transition: background 0.2s;
}
button:hover {
  background: #1d8ec1;
}
</style>
