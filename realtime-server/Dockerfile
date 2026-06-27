FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Hugging Face Spaces runs on port 7860 by default
EXPOSE 7860
ENV PORT=7860

CMD ["node", "index.js"]
