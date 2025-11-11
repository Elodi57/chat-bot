<!-- client/src/components/SuggestedQuestions.vue -->
<template>
  <div>
    <h4>Sugeridas</h4>
    <div class="list">
      <button v-for="(q, i) in questions" :key="i" @click="send(q)" class="q-btn">{{ q }}</button>
    </div>
  </div>
</template>

<script>
export default {
  setup(_, { emit }) {
    const questions = [
      '¿Cómo está el tiempo ahora en San Francisco?',
      '¿Va a llover hoy en San Francisco?',
      'Pronóstico para los próximos 3 días en San Francisco',
      '¿Cuál será la temperatura máxima y mínima en San Francisco?',
      '¿Cuál es la humedad y la velocidad del viento ahora en San Francisco?'
    ];
    function send(q) { emit('send', q); }
    return { questions, send };
  }
};
</script>

<style scoped>
h4 {
  margin-bottom: 10px;
  color: #0b1530;
  font-weight: 600;
}
.list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.q-btn {
  text-align: left;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid #dbe7f3;
  background: #f9fcff;
  color: #0b1530;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}
.q-btn:hover {
  background: #27A2DB;
  color: white;
  border-color: #27A2DB;
}
</style>

