import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Criar usuário admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Administrador',
      role: 'ADMIN',
      hasAccess: true,
    },
  })

  // Criar usuário com acesso
  const premiumUser = await prisma.user.upsert({
    where: { email: 'premium@example.com' },
    update: {},
    create: {
      email: 'premium@example.com',
      name: 'Usuário Premium',
      role: 'USER',
      hasAccess: true,
    },
  })

  // Criar usuário sem acesso
  const freeUser = await prisma.user.upsert({
    where: { email: 'free@example.com' },
    update: {},
    create: {
      email: 'free@example.com',
      name: 'Usuário Gratuito',
      role: 'USER',
      hasAccess: false,
    },
  })

  // Criar algumas novidades
  const news1 = await prisma.news.create({
    data: {
      title: 'Bem-vindos à Dashboard Privada!',
      content: 'Estamos muito felizes em ter vocês aqui. Esta é nossa nova plataforma exclusiva para membros premium. Aqui vocês encontrarão ferramentas exclusivas, conteúdo premium e uma comunidade ativa.',
      isHighlight: true,
    },
  })

  const news2 = await prisma.news.create({
    data: {
      title: 'Nova ferramenta adicionada',
      content: 'Acabamos de adicionar uma nova ferramenta ao nosso marketplace interno. Confira na aba Ferramentas!',
      isHighlight: false,
    },
  })

  const news3 = await prisma.news.create({
    data: {
      title: 'Chat da comunidade ativo',
      content: 'O bate-papo da comunidade está funcionando perfeitamente. Usuários premium podem enviar imagens e links, enquanto usuários gratuitos podem participar apenas com mensagens de texto.',
      isHighlight: true,
    },
  })

  // Criar algumas ferramentas
  const tool1 = await prisma.tool.create({
    data: {
      title: 'Gerador de Conteúdo',
      description: 'Uma ferramenta poderosa para gerar conteúdo automaticamente. Perfeita para criadores de conteúdo e marketeiros.',
      isActive: true,
    },
  })

  const tool2 = await prisma.tool.create({
    data: {
      title: 'Analisador de Métricas',
      description: 'Analise suas métricas de forma detalhada e obtenha insights valiosos para seu negócio.',
      isActive: true,
    },
  })

  const tool3 = await prisma.tool.create({
    data: {
      title: 'Automatizador de Tarefas',
      description: 'Automatize tarefas repetitivas e ganhe mais tempo para focar no que realmente importa.',
      isActive: true,
    },
  })

  const tool4 = await prisma.tool.create({
    data: {
      title: 'Editor de Imagens',
      description: 'Editor profissional de imagens com recursos avançados para criação de conteúdo visual.',
      isActive: true,
    },
  })

  // Criar algumas mensagens de exemplo
  const message1 = await prisma.message.create({
    data: {
      content: 'Olá pessoal! Bem-vindos ao chat da comunidade!',
      type: 'TEXT',
      userId: admin.id,
    },
  })

  const message2 = await prisma.message.create({
    data: {
      content: 'Que legal! Finalmente temos um espaço para conversar.',
      type: 'TEXT',
      userId: premiumUser.id,
    },
  })

  const message3 = await prisma.message.create({
    data: {
      content: 'Oi galera! Estou animado para usar as ferramentas premium!',
      type: 'TEXT',
      userId: freeUser.id,
    },
  })

  const message4 = await prisma.message.create({
    data: {
      content: 'https://example.com/link-premium',
      type: 'LINK',
      userId: premiumUser.id,
    },
  })

  console.log('Seed completed successfully!')
  console.log(`Created:`)
  console.log(`- Admin user: ${admin.email}`)
  console.log(`- Premium user: ${premiumUser.email}`)
  console.log(`- Free user: ${freeUser.email}`)
  console.log(`- ${3} news items`)
  console.log(`- ${4} tools`)
  console.log(`- ${4} chat messages`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })