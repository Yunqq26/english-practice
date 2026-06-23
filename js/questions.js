const QUESTION_BANK = [
  {
    id: 1,
    type: "sentence",
    date: "2026-06-01",
    source: "随着经济发展，环境污染变得越来越严重。",
    reference: "With economic development, environmental pollution is becoming increasingly serious.",
    grammar: "Present continuous 'is becoming' emphasizes a gradual ongoing change. 'With + noun' is a concise way to express 'along with / as a result of'.",
    keywords: [
      { word: "increasingly", synonyms: ["more and more", "progressively", "ever more"], note: "'increasingly serious' is more formal and common in academic writing than 'more and more serious'." },
      { word: "environmental pollution", synonyms: ["environmental contamination"], note: "'Contamination' often implies chemical or industrial pollution; 'pollution' is broader." }
    ],
    alternatives: [
      "As the economy grows, environmental pollution is getting ever more serious.",
      "Economic development has led to increasingly severe environmental pollution.",
      "With the advancement of the economy, the problem of environmental pollution is worsening."
    ],
    difficulty: "CET-6"
  },
  {
    id: 2,
    type: "sentence",
    date: "2026-06-02",
    source: "互联网的普及极大地改变了人们的生活方式。",
    reference: "The popularization of the Internet has dramatically changed people's lifestyles.",
    grammar: "Present perfect 'has changed' connects past action to present relevance. 'The popularization of...' is a nominalization common in formal English.",
    keywords: [
      { word: "popularization", synonyms: ["widespread adoption", "proliferation", "prevalence"], note: "'Proliferation' emphasizes rapid spread; 'prevalence' focuses on how common something is." },
      { word: "dramatically", synonyms: ["significantly", "profoundly", "radically"], note: "'Dramatically' and 'significantly' are the most common choices in CET-6 writing." }
    ],
    alternatives: [
      "The widespread adoption of the Internet has profoundly transformed the way people live.",
      "The Internet's prevalence has brought about significant changes in people's daily lives.",
      "People's lifestyles have been greatly altered by the spread of the Internet."
    ],
    difficulty: "CET-6"
  },
  {
    id: 3,
    type: "sentence",
    date: "2026-06-03",
    source: "大学生应该培养批判性思维能力，而不是一味接受书本知识。",
    reference: "College students should cultivate critical thinking skills rather than blindly accept knowledge from books.",
    grammar: "'Rather than + infinitive' contrasts two alternatives. 'Should cultivate' is a modal + verb expressing advice/recommendation.",
    keywords: [
      { word: "cultivate", synonyms: ["develop", "foster", "nurture"], note: "'Cultivate' and 'foster' are preferred in academic contexts over 'develop' for skills." },
      { word: "critical thinking", synonyms: ["analytical thinking", "independent thinking"], note: "'Critical thinking' is a fixed term in education — don't change the wording." }
    ],
    alternatives: [
      "University students ought to develop critical thinking abilities instead of passively absorbing textbook knowledge.",
      "Rather than unquestioningly accepting what is in books, college students need to foster their capacity for critical thought.",
      "Critical thinking skills should be cultivated among college students, rather than rote memorization of textual knowledge."
    ],
    difficulty: "CET-6"
  },
  {
    id: 4,
    type: "sentence",
    date: "2026-06-04",
    source: "面对全球气候变化，各国政府必须采取有效措施减少碳排放。",
    reference: "In the face of global climate change, governments around the world must take effective measures to reduce carbon emissions.",
    grammar: "'In the face of' is a fixed prepositional phrase meaning 'when confronted with'. 'Must + verb' expresses necessity/obligation.",
    keywords: [
      { word: "measures", synonyms: ["steps", "actions", "initiatives"], note: "'Take measures' is a common collocation; 'take steps' implies a gradual process." },
      { word: "reduce", synonyms: ["cut down on", "curb", "slash"], note: "'Curb' is strong (restrain/control); 'slash' is very strong (cut drastically)." }
    ],
    alternatives: [
      "Confronted with global climate change, all nations must implement effective policies to cut carbon emissions.",
      "Governments worldwide need to adopt effective strategies to curb carbon emissions in response to global climate change.",
      "Global climate change calls for effective action by every country to bring down carbon emissions."
    ],
    difficulty: "CET-6"
  },
  {
    id: 5,
    type: "sentence",
    date: "2026-06-05",
    source: "人工智能的发展引发了关于就业市场的广泛讨论。",
    reference: "The development of artificial intelligence has sparked widespread discussion about the job market.",
    grammar: "'Has sparked' — present perfect to describe a recent event with ongoing relevance. 'Widespread discussion about + noun' is a common pattern.",
    keywords: [
      { word: "sparked", synonyms: ["triggered", "ignited", "prompted"], note: "'Spark/trigger a discussion' is a very common collocation. 'Ignited' is more dramatic." },
      { word: "artificial intelligence", synonyms: ["AI", "machine intelligence"], note: "'AI' is acceptable after first mention. 'Machine intelligence' is less common." }
    ],
    alternatives: [
      "Advances in AI have triggered extensive debates about the employment landscape.",
      "The rise of artificial intelligence has given rise to heated discussions concerning the labor market.",
      "Artificial intelligence's progress has prompted broad conversations about the future of work."
    ],
    difficulty: "CET-6"
  },
  {
    id: 6,
    type: "sentence",
    date: "2026-06-06",
    source: "文化交流有助于增进不同国家人民之间的相互理解。",
    reference: "Cultural exchange helps to enhance mutual understanding among people from different countries.",
    grammar: "'Helps to + infinitive' — a common structure for stating purpose/benefit. 'Among + plural group' for three or more parties.",
    keywords: [
      { word: "enhance", synonyms: ["promote", "strengthen", "foster"], note: "'Enhance understanding' and 'promote understanding' are both excellent CET-6 phrases." },
      { word: "mutual understanding", synonyms: ["cross-cultural understanding", "reciprocal appreciation"], note: "'Mutual' is an essential CET-6 word — always paired with 'understanding' or 'respect'." }
    ],
    alternatives: [
      "Cultural interactions contribute to fostering mutual understanding between peoples of different nations.",
      "People-to-people cultural exchanges can greatly strengthen the bonds of understanding across countries.",
      "Through cultural exchange, mutual comprehension among diverse populations can be significantly improved."
    ],
    difficulty: "CET-6"
  },
  {
    id: 7,
    type: "sentence",
    date: "2026-06-07",
    source: "坚持锻炼身体不仅有益健康，还能缓解压力。",
    reference: "Persisting in physical exercise is not only beneficial to health but also helps relieve stress.",
    grammar: "'Not only... but also...' is a correlative conjunction used to connect two positive points. 'Persisting in + noun/gerund' is formal.",
    keywords: [
      { word: "persisting in", synonyms: ["insisting on", "keeping up", "maintaining"], note: "'Persist in' has a positive connotation here; 'insist on' can sound stubborn." },
      { word: "relieve", synonyms: ["alleviate", "ease", "reduce"], note: "'Relieve stress' is the most natural collocation. 'Alleviate' is more formal." }
    ],
    alternatives: [
      "Regular exercise not only benefits your health but also serves as a great stress reliever.",
      "Sticking to a workout routine does good to both physical health and mental well-being by reducing stress.",
      "Engaging in consistent physical activity contributes to better health and simultaneously alleviates tension."
    ],
    difficulty: "CET-6"
  },
  {
    id: 8,
    type: "sentence",
    date: "2026-06-08",
    source: "手机已经成为现代人生活中不可或缺的一部分。",
    reference: "Smartphones have become an indispensable part of modern people's lives.",
    grammar: "Present perfect 'have become' indicates a change that is now a settled fact. 'Indispensable part of...' is a high-level collocation.",
    keywords: [
      { word: "indispensable", synonyms: ["essential", "integral", "vital"], note: "'Indispensable' (~cannot be dispensed with) is stronger than 'essential'. Key CET-6 word." },
      { word: "modern people", synonyms: ["people today", "contemporary individuals", "modern society"], note: "'Modern people' is acceptable; 'people today' is more natural in conversation." }
    ],
    alternatives: [
      "Mobile phones have become an integral part of daily life in the modern world.",
      "In contemporary society, smartphones play an indispensable role in people's everyday existence.",
      "The smartphone has evolved into a vital tool that modern individuals cannot live without."
    ],
    difficulty: "CET-6"
  },
  {
    id: 9,
    type: "sentence",
    date: "2026-06-09",
    source: "这家公司通过创新技术在市场上获得了竞争优势。",
    reference: "This company has gained a competitive advantage in the market through innovative technology.",
    grammar: "'Through + noun phrase' indicates the means by which something is achieved. 'Gain a competitive advantage' is a fixed business phrase.",
    keywords: [
      { word: "competitive advantage", synonyms: ["competitive edge", "market advantage", "upper hand"], note: "'Competitive edge' is slightly informal but very common in business contexts." },
      { word: "innovative", synonyms: ["cutting-edge", "state-of-the-art", "groundbreaking"], note: "'Cutting-edge' and 'state-of-the-art' are vivid alternatives often used in business writing." }
    ],
    alternatives: [
      "By leveraging innovative technologies, the firm has secured a competitive edge in the marketplace.",
      "This enterprise has carved out a market advantage thanks to its technological innovations.",
      "The company's adoption of novel technologies has given it an edge over its competitors."
    ],
    difficulty: "CET-6"
  },
  {
    id: 10,
    type: "sentence",
    date: "2026-06-10",
    source: "传统文化在现代社会中仍然发挥着重要作用。",
    reference: "Traditional culture still plays an important role in modern society.",
    grammar: "'Plays an important role in...' is one of the most useful collocations in English. 'Still' emphasizes continuity.",
    keywords: [
      { word: "plays a role", synonyms: ["serves a function", "occupies a position", "has significance"], note: "'Plays a role in' is collocation #1 for CET-6 writing. Master it." },
      { word: "traditional culture", synonyms: ["cultural heritage", "conventional culture"], note: "'Cultural heritage' includes tangible and intangible aspects." }
    ],
    alternatives: [
      "Traditional culture continues to fulfill a significant function in contemporary society.",
      "In the modern era, our cultural heritage still holds considerable value and influence.",
      "The role of traditional culture in today's society remains as important as ever."
    ],
    difficulty: "CET-6"
  },
  {
    id: 11,
    type: "sentence",
    date: "2026-06-11",
    source: "阅读经典文学作品能够开阔眼界，丰富人生阅历。",
    reference: "Reading classic literary works can broaden one's horizons and enrich life experience.",
    grammar: "'Broaden one's horizons' is a fixed idiomatic expression. 'Reading + gerund' as subject is a common nominalization pattern.",
    keywords: [
      { word: "broaden", synonyms: ["expand", "widen", "extend"], note: "'Broaden horizons' is a fixed collocation — use exactly this phrase for maximum naturalness." },
      { word: "enrich", synonyms: ["enliven", "enhance", "enlarge"], note: "'Enrich' goes beautifully with 'experience'. It's the perfect CET-6 vocabulary word." }
    ],
    alternatives: [
      "Engaging with classic literature expands one's perspective and deepens one's understanding of life.",
      "Classic literary works have the power to open up new horizons and make one's life more fulfilling.",
      "By reading timeless literary masterpieces, people can gain broader views and more substantial life experience."
    ],
    difficulty: "CET-6"
  },
  {
    id: 12,
    type: "sentence",
    date: "2026-06-12",
    source: "成功需要付出艰辛的努力，没有捷径可走。",
    reference: "Success requires painstaking effort — there are no shortcuts.",
    grammar: "Dash (—) can replace a conjunction for dramatic emphasis. 'Requires + noun' is a direct statement of necessity.",
    keywords: [
      { word: "painstaking", synonyms: ["arduous", "strenuous", "grueling"], note: "'Painstaking' implies careful, thorough effort. 'Arduous' emphasizes difficulty and hardship." },
      { word: "shortcut", synonyms: ["easy path", "quick fix", "magic bullet"], note: "'No shortcuts' is an idiom. 'Quick fix' implies a temporary solution; 'magic bullet' implies a single, effortless solution." }
    ],
    alternatives: [
      "There is no royal road to success — it demands hard work and persistence.",
      "Achieving success calls for strenuous effort, and there is no easy way out.",
      "Success is not achieved overnight; it requires dedicated endeavor and there are no quick fixes."
    ],
    difficulty: "CET-6"
  },
  {
    id: 13,
    type: "sentence",
    date: "2026-06-13",
    source: "城市化的加速导致了许多社会问题的出现。",
    reference: "The acceleration of urbanization has led to the emergence of many social problems.",
    grammar: "'Has led to' — present perfect + phrasal verb indicating causation. 'The emergence of' is a formal nominalization.",
    keywords: [
      { word: "urbanization", synonyms: ["urban growth", "urban expansion", "urban development"], note: "'Urbanization' is the standard term for the process of population shift to cities." },
      { word: "led to", synonyms: ["resulted in", "given rise to", "contributed to"], note: "'Lead to' (v) / 'give rise to' (v) are essential causation phrases for CET-6 writing." }
    ],
    alternatives: [
      "Rapid urbanization has given rise to a host of societal issues.",
      "The accelerating pace of urban expansion has resulted in various social challenges.",
      "As cities expand at an unprecedented rate, a number of social problems have emerged."
    ],
    difficulty: "CET-6"
  },
  {
    id: 14,
    type: "sentence",
    date: "2026-06-14",
    source: "培养良好的阅读习惯对个人成长至关重要。",
    reference: "Cultivating good reading habits is crucial to personal growth.",
    grammar: "'Is crucial to + noun' expresses critical importance. Gerund 'Cultivating...' as subject creates a formal, topic-introducing sentence.",
    keywords: [
      { word: "crucial", synonyms: ["vital", "essential", "critical"], note: "'Crucial to' is followed by noun/gerund. 'Crucial for' is used before a purpose/outcome." },
      { word: "personal growth", synonyms: ["self-development", "individual development", "personal advancement"], note: "'Personal growth' emphasizes internal development; 'self-development' is more active/deliberate." }
    ],
    alternatives: [
      "Developing sound reading habits is vital for one's personal development.",
      "Good reading habits are essential to an individual's overall growth and self-improvement.",
      "The cultivation of strong reading practices is of great significance for personal advancement."
    ],
    difficulty: "CET-6"
  },
  {
    id: 15,
    type: "sentence",
    date: "2026-06-15",
    source: "这所大学以其在工程领域的卓越研究而闻名于世。",
    reference: "This university is world-famous for its outstanding research in the field of engineering.",
    grammar: "'Is world-famous for + noun' — 'for' introduces the reason for fame. 'In the field of + noun' specifies the domain.",
    keywords: [
      { word: "world-famous", synonyms: ["renowned", "prestigious", "internationally acclaimed"], note: "'Renowned' is more formal than 'world-famous'. 'Prestigious' focuses on reputation/status." },
      { word: "outstanding", synonyms: ["exceptional", "remarkable", "distinguished"], note: "'Distinguished' is the most formal — often used for long-established excellence." }
    ],
    alternatives: [
      "The university is internationally renowned for its exceptional engineering research.",
      "This institution has earned a global reputation for its distinguished contributions to engineering.",
      "Renowned across the globe, this university stands out for its breakthroughs in engineering research."
    ],
    difficulty: "CET-6"
  },
  {
    id: 16,
    type: "sentence",
    date: "2026-06-16",
    source: "均衡饮食和规律作息是保持健康的关键因素。",
    reference: "A balanced diet and regular daily routine are key factors in maintaining good health.",
    grammar: "'A + adjective + noun' pattern creates a clear subject. 'Key factors in + gerund/noun' is a fundamental CET-6 structure.",
    keywords: [
      { word: "balanced diet", synonyms: ["wholesome diet", "nutritious eating"], note: "'Balanced diet' is the standard term in health contexts." },
      { word: "key factors", synonyms: ["determinants", "cornerstones", "essential elements"], note: "'Cornerstones' is a metaphor — vivid and effective in essays." }
    ],
    alternatives: [
      "A nutritious diet coupled with a regular daily routine is fundamental to staying healthy.",
      "Eating a well-balanced diet and keeping consistent sleep hours are essential for good health.",
      "Good health hinges on two key factors: a balanced diet and a regular lifestyle."
    ],
    difficulty: "CET-6"
  },
  {
    id: 17,
    type: "sentence",
    date: "2026-06-17",
    source: "志愿者在灾难救援中发挥了不可替代的作用。",
    reference: "Volunteers played an irreplaceable role in disaster relief efforts.",
    grammar: "'Played an irreplaceable role in + noun/gerund' — past tense for specific past events. 'Irreplaceable' is a strong adjective.",
    keywords: [
      { word: "irreplaceable", synonyms: ["indispensable", "invaluable", "unique"], note: "'Irreplaceable' emphasizes that nothing can substitute. 'Invaluable' emphasizes great value." },
      { word: "disaster relief", synonyms: ["emergency response", "rescue operations", "humanitarian aid"], note: "'Disaster relief' is the standard term for post-disaster assistance." }
    ],
    alternatives: [
      "Volunteers made an invaluable contribution to disaster rescue operations.",
      "The role performed by volunteers in disaster response was beyond substitute.",
      "It is impossible to overstate the contribution of volunteers to disaster relief efforts."
    ],
    difficulty: "CET-6"
  },
  {
    id: 18,
    type: "sentence",
    date: "2026-06-18",
    source: "人们越来越意识到心理健康与身体健康同等重要。",
    reference: "People are increasingly aware that mental health is just as important as physical health.",
    grammar: "'Are increasingly aware that + clause' — present continuous shows a growing trend. 'Just as... as...' is a comparative equality structure.",
    keywords: [
      { word: "increasingly", synonyms: ["more and more", "progressively"], note: "'Increasingly + adjective' is a concise formal alternative to 'more and more + adjective'." },
      { word: "mental health", synonyms: ["psychological well-being", "emotional health"], note: "'Psychological well-being' is broader, including cognitive and emotional aspects." }
    ],
    alternatives: [
      "There is a growing recognition that mental well-being is equally important as physical fitness.",
      "More and more people have come to realize that psychological health deserves the same attention as physical health.",
      "The awareness is rising that mental and physical health carry equal weight in one's overall well-being."
    ],
    difficulty: "CET-6"
  },
  {
    id: 19,
    type: "sentence",
    date: "2026-06-19",
    source: "这个政策旨在缩小贫富差距，促进社会公平。",
    reference: "This policy aims to narrow the gap between the rich and the poor and promote social equity.",
    grammar: "'Aims to + infinitive' states purpose. 'The gap between X and Y' is a standard comparison structure.",
    keywords: [
      { word: "narrow the gap", synonyms: ["bridge the divide", "reduce inequality", "close the disparity"], note: "'Bridge the divide' is more metaphorical and vivid. 'Reduce inequality' is direct." },
      { word: "social equity", synonyms: ["social justice", "social fairness", "egalitarianism"], note: "'Equity' focuses on fairness of outcomes; 'equality' focuses on equal treatment." }
    ],
    alternatives: [
      "The policy is designed to bridge the wealth gap and foster social justice.",
      "This initiative seeks to reduce economic disparity and advance the cause of social fairness.",
      "By aiming to close the rich-poor divide, this policy contributes to a more equitable society."
    ],
    difficulty: "CET-6"
  },
  {
    id: 20,
    type: "sentence",
    date: "2026-06-20",
    source: "在职场上，沟通能力往往比专业知识更重要。",
    reference: "In the workplace, communication skills are often more important than professional knowledge.",
    grammar: "'Often + comparative' expresses a frequent observation. 'More important than' is the standard comparative form for adjectives of 3+ syllables.",
    keywords: [
      { word: "communication skills", synonyms: ["interpersonal skills", "social competence", "people skills"], note: "'Communication skills' is the standard term. 'People skills' is informal but common in workplace contexts." },
      { word: "professional knowledge", synonyms: ["expertise", "technical know-how", "domain knowledge"], note: "'Expertise' is more concise and formal than 'professional knowledge'." }
    ],
    alternatives: [
      "On the job, the ability to communicate effectively frequently outweighs technical expertise.",
      "Strong interpersonal skills can matter more in a career than deep professional knowledge.",
      "In professional settings, communication competence often trumps specialized domain knowledge."
    ],
    difficulty: "CET-6"
  },
  {
    id: 21,
    type: "sentence",
    date: "2026-06-21",
    source: "这部纪录片揭示了消费主义对环境的负面影响。",
    reference: "This documentary reveals the negative impact of consumerism on the environment.",
    grammar: "'Reveals the negative impact of X on Y' — a formal cause-effect structure. 'Consumerism' is an abstract noun ending in -ism.",
    keywords: [
      { word: "reveals", synonyms: ["exposes", "uncovers", "lays bare"], note: "'Expose' implies revealing something hidden/unpleasant. 'Lay bare' is dramatic and vivid." },
      { word: "consumerism", synonyms: ["materialism", "consumer culture"], note: "'Consumerism' is the economic/social order. 'Materialism' is the value system." }
    ],
    alternatives: [
      "The documentary lays bare the detrimental effects of consumer culture on our environment.",
      "This film exposes how consumerism is taking a toll on the natural environment.",
      "Through this documentary, the harmful environmental consequences of consumerism are brought to light."
    ],
    difficulty: "CET-6"
  },
  {
    id: 22,
    type: "sentence",
    source: "终身学习的理念正在被越来越多的人所接受。",
    reference: "The concept of lifelong learning is being embraced by a growing number of people.",
    grammar: "'Is being embraced' — present continuous passive emphasizes the ongoing reception of the idea. 'A growing number of + plural noun' indicates increase.",
    keywords: [
      { word: "concept", synonyms: ["notion", "idea", "philosophy"], note: "'Concept' is neutral and formal. 'Notion' is slightly less formal." },
      { word: "embraced", synonyms: ["accepted", "adopted", "embraced warmly"], note: "'Embrace' carries a positive connotation of welcoming, not just accepting." }
    ],
    alternatives: [
      "An increasing number of people are coming to accept the notion of lifelong education.",
      "The philosophy of continuous learning is gaining wider acceptance among the general public.",
      "More and more individuals are embracing the idea that learning never stops."
    ],
    difficulty: "CET-6"
  },
  {
    id: 23,
    type: "sentence",
    source: "社交媒体对年轻人的自我认同有着深远的影响。",
    reference: "Social media has a profound impact on young people's self-identity.",
    grammar: "'Has a profound impact on + noun' — a powerful cause-effect phrase. 'Self-identity' is a compound noun common in psychology and sociology.",
    keywords: [
      { word: "profound", synonyms: ["significant", "deep", "far-reaching"], note: "'Profound impact' is a high-frequency collocation for CET-6 essays." },
      { word: "self-identity", synonyms: ["self-image", "personal identity", "sense of self"], note: "'Self-identity' is the internal sense of who you are; 'self-image' is how you perceive yourself." }
    ],
    alternatives: [
      "Social networking platforms exert a far-reaching influence on how young people perceive themselves.",
      "The effect of social media on adolescents' self-image and identity formation cannot be overstated.",
      "Young people's sense of self is being deeply shaped by their engagement with social media."
    ],
    difficulty: "CET-6"
  },
  {
    id: 24,
    type: "sentence",
    source: "有效的沟通能够避免很多不必要的误解。",
    reference: "Effective communication can avoid many unnecessary misunderstandings.",
    grammar: "'Can + infinitive' expresses ability/possibility. 'Unnecessary' is a negative prefix (un-) + 'necessary' — a common word-formation pattern.",
    keywords: [
      { word: "effective", synonyms: ["efficient", "productive", "fruitful"], note: "'Efficient' emphasizes doing things right; 'effective' emphasizes doing the right things." },
      { word: "misunderstandings", synonyms: ["miscommunications", "misconceptions", "confusion"], note: "'Misunderstanding' is the general term. 'Miscommunication' specifically faults the communication process." }
    ],
    alternatives: [
      "Good communication helps prevent a great deal of needless confusion.",
      "When people communicate effectively, a host of unnecessary conflicts can be avoided.",
      "Clear and effective dialogue serves as a safeguard against unwarranted misunderstandings."
    ],
    difficulty: "CET-6"
  },
  {
    id: 25,
    type: "sentence",
    source: "出国留学可以开阔视野，体验不同的文化。",
    reference: "Studying abroad can broaden one's horizons and expose one to different cultures.",
    grammar: "'Studying abroad' — gerund as subject. 'Broaden one's horizons' + 'expose one to' — pair of beneficial outcomes.",
    keywords: [
      { word: "horizons", synonyms: ["perspectives", "outlook", "worldview"], note: "'Broaden horizons' is the set phrase. 'Perspectives' is more analytical." },
      { word: "expose to", synonyms: ["immerse in", "introduce to", "experience"], note: "'Expose to' implies first-hand contact; 'immerse in' implies deep involvement." }
    ],
    alternatives: [
      "Overseas study offers the chance to expand one's worldview and engage with diverse cultures.",
      "Studying in a foreign country provides opportunities to gain new perspectives and experience different ways of life.",
      "International education allows students to step out of their comfort zone and encounter unfamiliar cultures first-hand."
    ],
    difficulty: "CET-6"
  },
  {
    id: 26,
    type: "sentence",
    source: "团队合作能够汇集每个人的智慧，产生更好的解决方案。",
    reference: "Teamwork can pool everyone's wisdom and produce better solutions.",
    grammar: "'Pool + noun' is a verb metaphor meaning 'combine/share resources'. 'And' connects two parallel results.",
    keywords: [
      { word: "pool", synonyms: ["combine", "consolidate", "bring together"], note: "'Pool resources/wisdom' — 'pool' as a verb is a useful CET-6 word." },
      { word: "solutions", synonyms: ["answers", "resolutions", "approaches"], note: "'Solutions to problems' — always use 'to' as the preposition." }
    ],
    alternatives: [
      "Collaboration harnesses the collective intelligence of all members, leading to superior outcomes.",
      "When people work as a team, they draw on each other's strengths to devise more effective solutions.",
      "The synergy of teamwork brings together diverse insights, resulting in more robust problem-solving."
    ],
    difficulty: "CET-6"
  },
  {
    id: 27,
    type: "sentence",
    source: "政府应该加大对公共教育的投入，提高教育质量。",
    reference: "The government should increase investment in public education to improve the quality of education.",
    grammar: "'Increase investment in + noun' — a policy-oriented phrase. 'To + infinitive' expresses purpose. 'Improve the quality of + noun' is a standard collocation.",
    keywords: [
      { word: "investment", synonyms: ["funding", "expenditure", "allocation"], note: "'Investment' implies long-term benefit; 'funding' is neutral." },
      { word: "improve", synonyms: ["enhance", "elevate", "raise the standard of"], note: "'Enhance quality' is preferred in formal writing over 'improve quality'." }
    ],
    alternatives: [
      "Greater public funding should be directed toward education to raise the standard of instruction.",
      "The government ought to allocate more resources to public education in order to elevate its overall quality.",
      "Increasing fiscal investment in education is essential for upgrading the quality of teaching and learning."
    ],
    difficulty: "CET-6"
  },
  {
    id: 28,
    type: "sentence",
    source: "诚实是一种宝贵的品质，应该从小培养。",
    reference: "Honesty is a valuable quality that should be cultivated from an early age.",
    grammar: "'That should be cultivated' — relative clause in passive voice. 'From an early age' is a fixed time phrase.",
    keywords: [
      { word: "valuable quality", synonyms: ["precious trait", "virtue", "admirable characteristic"], note: "'Virtue' is the classic term for moral excellence." },
      { word: "cultivated", synonyms: ["nurtured", "instilled", "developed"], note: "'Instill' (e.g., instill values in children) is very formal and apt for this context." }
    ],
    alternatives: [
      "Honesty is a virtue that needs to be nurtured in childhood.",
      "As a precious character trait, honesty should be fostered from a young age.",
      "The value of honesty is something that ought to be instilled in children early on."
    ],
    difficulty: "CET-6"
  },
  {
    id: 29,
    type: "sentence",
    source: "旅游业的快速发展为当地经济注入了新的活力。",
    reference: "The rapid development of tourism has injected new vitality into the local economy.",
    grammar: "'Has injected new vitality into + noun' — a vivid metaphorical phrase (like an injection). Present perfect connects past development to present state.",
    keywords: [
      { word: "injected", synonyms: ["infused", "breathed", "pumped"], note: "'Inject vitality' is a fixed metaphor. 'Infuse' is gentler; 'pump' is more forceful." },
      { word: "vitality", synonyms: ["vigor", "energy", "dynamism"], note: "'Vitality' suggests liveliness and sustainability; 'dynamism' suggests constant change/activity." }
    ],
    alternatives: [
      "The flourishing tourism sector has breathed new life into the regional economy.",
      "Rapid growth in the travel industry has brought fresh energy to the local economic landscape.",
      "Local economies have been revitalized by the booming tourism industry."
    ],
    difficulty: "CET-6"
  },
  {
    id: 30,
    type: "sentence",
    source: "在很多国家，性别平等仍然是一个亟待解决的问题。",
    reference: "In many countries, gender equality remains an urgent problem to be solved.",
    grammar: "'Remains + noun/adjective' states the continuing state. 'An urgent problem to be solved' — infinitive phrase modifying 'problem' (passive meaning).",
    keywords: [
      { word: "gender equality", synonyms: ["sexual equality", "gender parity", "equal rights"], note: "'Gender equality' is the current standard term. 'Parity' emphasizes numerical balance." },
      { word: "urgent", synonyms: ["pressing", "critical", "imperative"], note: "'Pressing issue' is a common collocation. 'Imperative' is very strong (must be done)." }
    ],
    alternatives: [
      "Many countries are still faced with the pressing challenge of achieving gender equality.",
      "Gender parity remains a critical issue that demands immediate attention in numerous nations.",
      "The issue of equal rights for men and women has yet to be adequately addressed in many parts of the world."
    ],
    difficulty: "CET-6"
  },
  {
    id: 31,
    type: "sentence",
    source: "乐观的态度有助于我们更好地应对生活中的挑战。",
    reference: "An optimistic attitude helps us better cope with challenges in life.",
    grammar: "'Helps + object + infinitive' — the object 'us' is the one helped. 'Cope with' is a phrasal verb meaning 'deal effectively with'.",
    keywords: [
      { word: "optimistic", synonyms: ["positive", "upbeat", "hopeful"], note: "'Optimistic' is more formal than 'positive'. 'Upbeat' is informal/colloquial." },
      { word: "cope with", synonyms: ["deal with", "handle", "tackle", "confront"], note: "'Cope with' implies managing despite difficulty. 'Tackle' implies taking on proactively." }
    ],
    alternatives: [
      "A positive outlook enables us to face life's challenges more effectively.",
      "Maintaining an optimistic mindset can help people navigate difficulties with greater resilience.",
      "The way we approach challenges is greatly influenced by our attitude — optimism leads to better outcomes."
    ],
    difficulty: "CET-6"
  },
  {
    id: 32,
    type: "sentence",
    source: "保护生物多样性对于维持生态平衡至关重要。",
    reference: "Protecting biodiversity is essential for maintaining ecological balance.",
    grammar: "'Protecting + noun' — gerund as subject. 'Is essential for + gerund/noun' expresses necessary condition.",
    keywords: [
      { word: "biodiversity", synonyms: ["biological diversity", "ecological diversity"], note: "'Biodiversity' is the standard term — a contraction of 'biological diversity'." },
      { word: "ecological balance", synonyms: ["environmental equilibrium", "natural harmony"], note: "'Ecological balance' is the most common term in environmental writing." }
    ],
    alternatives: [
      "The conservation of biodiversity is vital to preserving the equilibrium of our ecosystem.",
      "Safeguarding biological diversity plays an indispensable role in keeping nature in balance.",
      "Maintaining biodiversity is fundamental to the stability and health of the natural world."
    ],
    difficulty: "CET-6"
  },
  {
    id: 33,
    type: "sentence",
    source: "失败是成功之母，我们应该从失败中吸取教训。",
    reference: "Failure is the mother of success — we should learn from our failures.",
    grammar: "Dash separates the proverb from the practical advice. 'Learn from + noun' is a standard phrase of reflection.",
    keywords: [
      { word: "learn from", synonyms: ["draw lessons from", "take heed from"], note: "'Draw lessons from' is more formal and reflective. A CET-6 essay phrase." },
      { word: "failure", synonyms: ["setback", "adversity", "defeat"], note: "'Setback' is milder than 'failure' (temporary obstacle). 'Adversity' is broader." }
    ],
    alternatives: [
      "Setbacks pave the way for success — it is crucial that we take lessons from our mistakes.",
      "As the saying goes, failure teaches success; therefore we should reflect on our missteps.",
      "Rather than fearing failure, we should embrace it as a valuable teacher on the road to achievement."
    ],
    difficulty: "CET-6"
  },
  {
    id: 34,
    type: "sentence",
    source: "越来越多的人选择骑自行车出行以减少碳足迹。",
    reference: "More and more people are choosing to travel by bicycle to reduce their carbon footprint.",
    grammar: "'Are choosing to + infinitive' — present continuous indicates a growing trend. 'To reduce their carbon footprint' — infinitive of purpose.",
    keywords: [
      { word: "carbon footprint", synonyms: ["carbon emissions", "environmental impact", "ecological footprint"], note: "'Carbon footprint' is the household term. 'Ecological footprint' is broader." },
      { word: "travel by bicycle", synonyms: ["cycle", "bike", "ride a bicycle"], note: "'Cycle' (v) is concise. 'Bike' (v) is informal." }
    ],
    alternatives: [
      "An increasing number of individuals are opting to cycle as a way to minimize their environmental impact.",
      "Biking is becoming a preferred mode of transport for many who wish to lower their carbon emissions.",
      "More people than ever are turning to bicycles as an eco-friendly alternative for daily commuting."
    ],
    difficulty: "CET-6"
  },
  {
    id: 35,
    type: "sentence",
    source: "在线教育为无法到校学习的人提供了灵活的学习方式。",
    reference: "Online education provides flexible learning methods for those who cannot attend school.",
    grammar: "'Provides + noun + for + someone' — a standard pattern of provision. 'Those who' is a formal way to refer to a group of people.",
    keywords: [
      { word: "flexible", synonyms: ["adaptable", "adjustable"], note: "'Flexible' is the standard positive adjective for describing learning schedules and methods." },
      { word: "online education", synonyms: ["e-learning", "distance learning", "virtual education"], note: "'E-learning' emphasizes electronic delivery; 'distance learning' emphasizes physical separation." }
    ],
    alternatives: [
      "E-learning offers adaptable study options for individuals unable to attend traditional classes.",
      "Those who face barriers to on-campus education can now pursue learning through flexible online programs.",
      "Online learning has opened up educational opportunities for people who otherwise could not attend school."
    ],
    difficulty: "CET-6"
  },
  {
    id: 36,
    type: "sentence",
    source: "良好的时间管理能力是提高工作效率的关键。",
    reference: "Good time management skills are key to improving work efficiency.",
    grammar: "'Are key to + gerund/noun' — 'key to' uses the preposition 'to'. 'Improving work efficiency' — gerund after a preposition.",
    keywords: [
      { word: "time management", synonyms: ["prioritization", "scheduling", "organization"], note: "'Time management' is the standard term for this soft skill." },
      { word: "efficiency", synonyms: ["productivity", "effectiveness"], note: "'Efficiency' = doing things right (speed/resources). 'Effectiveness' = doing the right things (outcome)." }
    ],
    alternatives: [
      "The ability to manage one's time well is fundamental to achieving higher productivity at work.",
      "Efficient time management lies at the heart of enhanced workplace performance.",
      "Mastering time management skills is essential for maximizing work output."
    ],
    difficulty: "CET-6"
  },
  {
    id: 37,
    type: "sentence",
    source: "科技创新是推动社会进步的核心动力。",
    reference: "Technological innovation is the core driving force behind social progress.",
    grammar: "'Is the core driving force behind + noun' — a strong causal statement. 'Behind' here means 'underlying/causing'.",
    keywords: [
      { word: "core driving force", synonyms: ["main engine", "primary impetus", "key driver"], note: "'Driving force' is a common metaphor. 'Impetus' is more formal." },
      { word: "social progress", synonyms: ["societal advancement", "human progress"], note: "'Social progress' emphasizes improvements in social structures; 'human progress' is broader." }
    ],
    alternatives: [
      "Innovation in science and technology serves as the primary engine of societal advancement.",
      "The key impetus behind social development comes from continuous technological breakthroughs.",
      "Technological innovation acts as a catalyst that propels society forward."
    ],
    difficulty: "CET-6"
  },
  {
    id: 38,
    type: "sentence",
    source: "父母应该尊重孩子的兴趣爱好，而不是强迫他们学习。",
    reference: "Parents should respect their children's interests and hobbies rather than forcing them to study.",
    grammar: "'Rather than + gerund' compares two actions, preferring the first. 'Force + object + infinitive' is a causative structure.",
    keywords: [
      { word: "interests and hobbies", synonyms: ["passions", "pursuits", "pastimes"], note: "'Passions' implies strong enthusiasm. 'Pursuits' sounds more formal." },
      { word: "forcing", synonyms: ["compelling", "pressuring", "coercing"], note: "'Compel' is formal. 'Coerce' is very strong (implies threat). 'Pressure' is milder." }
    ],
    alternatives: [
      "Instead of pressuring children to study, parents ought to respect what genuinely interests them.",
      "Children's passions and pursuits should be respected by parents, not suppressed in favor of forced study.",
      "Parents do better to support their children's natural inclinations than to impose rigid academic demands."
    ],
    difficulty: "CET-6"
  },
  {
    id: 39,
    type: "sentence",
    source: "大城市的生活成本越来越高，年轻人面临巨大压力。",
    reference: "The cost of living in big cities is getting higher and higher, putting young people under tremendous pressure.",
    grammar: "'Is getting higher and higher' — repetitive comparative to emphasize continuous increase. 'Put + object + under pressure' — a causative phrase.",
    keywords: [
      { word: "cost of living", synonyms: ["living expenses", "costs of daily life"], note: "'Cost of living' is the standard economic term." },
      { word: "tremendous", synonyms: ["immense", "enormous", "colossal"], note: "'Tremendous' and 'immense' are common in CET-6 to intensify nouns." }
    ],
    alternatives: [
      "Soaring living costs in major cities are placing enormous strain on the younger generation.",
      "Young people in metropolitan areas are under immense pressure due to the ever-rising cost of living.",
      "The escalating expenses associated with urban life have created significant challenges for young adults."
    ],
    difficulty: "CET-6"
  },
  {
    id: 40,
    type: "sentence",
    source: "环境保护需要全球合作，任何国家都无法独善其身。",
    reference: "Environmental protection requires global cooperation — no country can solve the problem alone.",
    grammar: "'Requires + noun' states necessity. Dash introduces a clarifying statement. 'Can + infinitive' with 'no' creates a negative statement.",
    keywords: [
      { word: "environmental protection", synonyms: ["environmental conservation", "ecological preservation"], note: "'Conservation' focuses on wise use; 'preservation' focuses on keeping unchanged." },
      { word: "global cooperation", synonyms: ["international collaboration", "multilateral efforts"], note: "'Multilateral' is a key diplomatic term involving multiple countries." }
    ],
    alternatives: [
      "Safeguarding the environment calls for worldwide collaboration — no nation can do it in isolation.",
      "Ecological challenges demand a united global response; no single country can address them single-handedly.",
      "Environmental issues transcend borders, making international cooperation essential and unilateral action insufficient."
    ],
    difficulty: "CET-6"
  },
  // ===== Paragraph Translation Questions (CET-6 Style) =====
  {
    id: 41,
    type: "paragraph",
    source: "中国是一个历史悠久、文化丰富的国家。它不仅拥有壮丽的自然风光，还有众多闻名世界的文化遗产。近年来，随着旅游业的发展，越来越多的外国游客选择来中国旅游，体验中国的传统文化和现代风貌。",
    reference: "China is a country with a long history and rich culture. It not only boasts magnificent natural scenery, but also has numerous world-renowned cultural heritages. In recent years, with the development of tourism, more and more foreign tourists choose to travel to China to experience its traditional culture and modern landscape.",
    grammar: "Parallel structure 'not only... but also...' connects two positive attributes. 'With the development of' is a common introductory phrase for cause-effect. 'Choose to + infinitive' expresses purpose.",
    keywords: [
      { word: "world-renowned", synonyms: ["globally famous", "internationally acclaimed", "world-famous"], note: "'World-renowned' is a compound adjective commonly used before nouns like 'cultural heritage'." },
      { word: "magnificent", synonyms: ["spectacular", "breathtaking", "splendid"], note: "'Magnificent' describes grand beauty; 'breathtaking' emphasizes emotional impact." }
    ],
    alternatives: [
      "With a long history and vibrant culture, China attracts visitors with both its natural beauty and its celebrated cultural landmarks, a trend that has grown alongside the tourism industry.",
      "China, a country of profound history and rich cultural heritage, is home to stunning landscapes and world-famous cultural sites. The booming tourism sector has drawn an increasing number of international travelers eager to explore its traditions and modern achievements."
    ],
    difficulty: "CET-6"
  },
  {
    id: 42,
    type: "paragraph",
    source: "随着科技的飞速发展，人工智能已经深入到我们生活的方方面面。从智能手机到智能家居，从自动驾驶到医疗诊断，AI技术正在改变着我们的工作和生活方式。然而，人工智能的快速发展也带来了一系列伦理和社会问题，需要我们认真思考。",
    reference: "With the rapid development of technology, artificial intelligence has penetrated every aspect of our lives. From smartphones to smart homes, from autonomous driving to medical diagnosis, AI technology is changing the way we work and live. However, the rapid advancement of AI has also brought about a series of ethical and social issues that require our serious consideration.",
    grammar: "'Has penetrated' — present perfect emphasizes the widespread reach. 'From... to... from... to...' — parallel structure listing examples. 'Has brought about' — phrasal verb indicating causation. 'That require + noun' — relative clause for necessity.",
    keywords: [
      { word: "penetrated", synonyms: ["permeated", "infiltrated", "become integrated into"], note: "'Penetrate' emphasizes deep and thorough reach into all areas." },
      { word: "autonomous", synonyms: ["self-driving", "automated", "driverless"], note: "'Autonomous driving' is the technical term; 'self-driving' is more common in everyday language." }
    ],
    alternatives: [
      "Rapid technological advances have embedded AI into nearly every dimension of modern existence — from mobile devices to home automation, and from self-driving cars to healthcare diagnostics. Yet this swift progress also raises profound ethical and societal questions that demand careful reflection.",
      "Artificial intelligence, driven by breakneck technological progress, has permeated daily life in countless ways. Whether through smartphones, smart appliances, autonomous vehicles, or medical diagnostics, AI is reshaping how we live and work. But this rapid transformation comes with its own set of ethical and social challenges that we cannot afford to ignore."
    ],
    difficulty: "CET-6"
  },
  {
    id: 43,
    type: "paragraph",
    source: "教育是国家发展的基石。在当今社会，教育不仅仅传授知识，更重要的是培养学生的创新思维和解决实际问题的能力。因此，教育改革一直在进行，目的是为了适应时代发展的需要，培养出更多优秀的人才。",
    reference: "Education is the foundation of national development. In today's society, education not only imparts knowledge but, more importantly, cultivates students' innovative thinking and ability to solve practical problems. Therefore, educational reform has been ongoing, with the aim of meeting the needs of the times and cultivating more outstanding talents.",
    grammar: "'Not only... but...' — can be used without 'also' for emphasis. 'Has been ongoing' — present perfect continuous emphasizes the continuing nature of the reform. 'With the aim of + gerund' — expresses purpose formally.",
    keywords: [
      { word: "imparts", synonyms: ["transmits", "conveys", "passes on"], note: "'Impart knowledge' is a formal collocation. 'Transmit' is more technical." },
      { word: "cultivates", synonyms: ["fosters", "nurtures", "develops"], note: "'Cultivate thinking' is a key CET-6 collocation. 'Foster' implies active encouragement." }
    ],
    alternatives: [
      "Education serves as the bedrock of a nation's progress. Beyond merely transmitting knowledge, it plays a crucial role in developing students' capacity for creative thought and real-world problem-solving. This is why educational systems are constantly evolving — to keep pace with the changing times and produce well-rounded, capable individuals.",
      "As the cornerstone of national growth, education must do more than pass on information. Its true value lies in nurturing creativity and practical competence. Continuous reforms in education aim to align with societal needs and prepare talented individuals who can thrive in a rapidly changing world."
    ],
    difficulty: "CET-6"
  },
  {
    id: 44,
    type: "paragraph",
    source: "城市化进程的加速给人们的生活带来了便利，但同时也伴随着一系列问题，如住房紧张、交通拥堵和环境污染。为了解决这些问题，政府采取了许多措施，包括修建公共交通系统、推广绿色建筑以及加强环境监管。",
    reference: "The acceleration of urbanization has brought convenience to people's lives, but it has also been accompanied by a series of problems, such as housing shortages, traffic congestion, and environmental pollution. To solve these problems, the government has taken many measures, including building public transportation systems, promoting green buildings, and strengthening environmental supervision.",
    grammar: "'Has brought... but has also been accompanied by...' — contrasting structure within present perfect. 'Such as + noun list' — introducing examples. 'Including + gerund list' — parallel listing of actions.",
    keywords: [
      { word: "congestion", synonyms: ["gridlock", "traffic jams", "bottlenecks"], note: "'Traffic congestion' is the formal term; 'gridlock' is more dramatic." },
      { word: "supervision", synonyms: ["regulation", "oversight", "monitoring"], note: "'Environmental supervision' is a policy term; 'regulation' emphasizes rules and enforcement." }
    ],
    alternatives: [
      "While rapid urbanization has made life more convenient, it has also given rise to pressing challenges: housing shortages, traffic congestion, and environmental degradation. In response, authorities have rolled out initiatives ranging from public transit expansion and eco-friendly construction to stricter environmental oversight.",
      "The accelerated pace of urban growth brings undeniable convenience alongside significant drawbacks — most notably, strained housing, clogged roads, and polluted surroundings. Governments have responded with a multi-pronged approach: investing in public transit, encouraging sustainable architecture, and tightening environmental regulations."
    ],
    difficulty: "CET-6"
  },
  {
    id: 45,
    type: "paragraph",
    source: "健康的生活方式对每个人来说都非常重要。专家建议，人们应该保持均衡的饮食，定期参加体育锻炼，并保证充足的睡眠。此外，保持良好的心态和积极的社交关系也是健康生活的重要组成部分。",
    reference: "A healthy lifestyle is very important for everyone. Experts recommend that people maintain a balanced diet, participate in regular physical exercise, and ensure adequate sleep. In addition, maintaining a positive mindset and good social relationships are also important components of a healthy life.",
    grammar: "'Recommend that + subject + verb (subjunctive)' — the subjunctive mood (maintain, not maintains). 'In addition' — transition phrase for adding information. Gerund subjects: 'maintaining... are'.",
    keywords: [
      { word: "balanced diet", synonyms: ["nutritious eating", "well-rounded diet", "wholesome food choices"], note: "'Balanced diet' is the standard health term; 'nutritious eating' focuses on nutritional value." },
      { word: "adequate", synonyms: ["sufficient", "enough", "ample"], note: "'Adequate sleep' is more formal than 'enough sleep' and preferred in academic writing." }
    ],
    alternatives: [
      "Everyone stands to benefit from a healthy lifestyle. Health professionals advise eating a well-balanced diet, exercising on a regular basis, and getting plenty of rest. Equally important are a positive outlook and meaningful social connections, both of which contribute significantly to overall well-being.",
      "The importance of a healthy lifestyle cannot be overstated. A nutritious diet, consistent exercise, and sufficient rest form the foundation, while mental well-being and strong social ties round out the picture of genuine health."
    ],
    difficulty: "CET-6"
  },
  {
    id: 46,
    type: "paragraph",
    source: "电子商务的兴起彻底改变了人们的购物方式。现在，消费者只需要动动手指，就可以在网上购买到来自世界各地的商品。同时，在线支付和快递服务的发展也使网上购物变得更加方便快捷。",
    reference: "The rise of e-commerce has completely changed the way people shop. Now, consumers only need to move their fingers to purchase goods from all over the world online. At the same time, the development of online payment and express delivery services has made online shopping more convenient and efficient.",
    grammar: "'Has completely changed' — present perfect emphasizes the transformative effect. 'Only need to + infinitive' — expressing simplicity. 'Has made + noun + adjective' — causative structure.",
    keywords: [
      { word: "e-commerce", synonyms: ["online shopping", "electronic commerce", "digital retail"], note: "'E-commerce' is the industry term. 'Electronic commerce' is the full form rarely used in everyday speech." },
      { word: "express delivery", synonyms: ["courier service", "parcel delivery", "shipping"], note: "'Express delivery' emphasizes speed; 'courier service' emphasizes the service provider." }
    ],
    alternatives: [
      "Online commerce has revolutionized the shopping experience. Today, with just a few clicks, consumers can buy products sourced from across the globe. The convenience is further amplified by seamless digital payment systems and fast courier networks that make transactions smooth and swift.",
      "The way people shop has been transformed by the boom in e-commerce. A few finger taps are all it takes to order items from anywhere in the world. Combined with efficient online payment and speedy logistics, the entire process has become remarkably effortless."
    ],
    difficulty: "CET-6"
  },
  {
    id: 47,
    type: "paragraph",
    source: "春节是中国最重要的传统节日，象征着团圆和新的一年的开始。在春节期间，家人会聚在一起吃年夜饭、看春晚、放鞭炮。此外，人们还会走亲访友，互致新年祝福。",
    reference: "The Spring Festival is the most important traditional holiday in China, symbolizing reunion and the beginning of a new year. During the Spring Festival, families gather together to have a New Year's Eve dinner, watch the Spring Festival Gala, and set off firecrackers. In addition, people visit relatives and friends to exchange New Year's greetings.",
    grammar: "'Symbolizing + noun' — present participle as explanation. 'During + noun' — preposition for time period. 'To exchange + noun' — infinitive of purpose. Parallel verbs: 'gather, have, watch, set off'.",
    keywords: [
      { word: "symbolizing", synonyms: ["representing", "signifying", "embodying"], note: "'Symbolize' refers to representing an abstract concept through a concrete tradition." },
      { word: "reunion", synonyms: ["family gathering", "get-together"], note: "'Reunion' specifically implies family members coming together after being apart." }
    ],
    alternatives: [
      "As China's most significant traditional festival, the Spring Festival embodies the values of family reunion and new beginnings. Families come together for a festive meal on New Year's Eve, enjoy the televised gala, and light firecrackers. Visiting friends and relatives to offer seasonal greetings is another cherished custom.",
      "The Spring Festival, a time of reunion and renewal, stands at the heart of Chinese tradition. Families reunite for a lavish dinner, watch the annual Spring Festival Gala, and celebrate with firecrackers. The holiday is also marked by rounds of visiting, as people share warm wishes for the year ahead."
    ],
    difficulty: "CET-6"
  },
  {
    id: 48,
    type: "paragraph",
    source: "水资源短缺已经成为全球面临的严峻挑战之一。造成这一问题的原因包括人口增长、工业用水增加以及水资源浪费。为了解决水资源危机，科学家们正在开发新的技术，如海水淡化和污水处理再利用。",
    reference: "Water scarcity has become one of the severe challenges facing the world. The causes of this problem include population growth, increased industrial water use, and water waste. To solve the water crisis, scientists are developing new technologies, such as seawater desalination and wastewater treatment and reuse.",
    grammar: "'Has become one of + plural noun' — present perfect + partitive. 'The causes of + noun include + noun list' — definition structure. 'To solve + noun' — infinitive of purpose.",
    keywords: [
      { word: "scarcity", synonyms: ["shortage", "deficiency", "dearth"], note: "'Water scarcity' is the standard environmental term; 'shortage' is more general." },
      { word: "desalination", synonyms: ["seawater conversion", "salt removal"], note: "'Desalination' is the precise technical term for removing salt from seawater." }
    ],
    alternatives: [
      "Global water scarcity presents a critical challenge driven by population growth, rising industrial demand, and inefficient usage. Scientists are tackling the crisis through technological innovations, including desalination and advanced wastewater treatment systems.",
      "The world faces an increasingly urgent water crisis fueled by demographic pressures, industrial expansion, and wasteful consumption. In response, researchers are pioneering solutions — from converting seawater to potable water to recycling wastewater for productive use."
    ],
    difficulty: "CET-6"
  },
  {
    id: 49,
    type: "paragraph",
    source: "在现代社会，终身学习的理念越来越受到人们的重视。随着知识更新速度的加快，仅仅依靠学校获得的知识已经远远不够。通过在线课程、职业培训和各种自学方式，人们可以不断更新自己的知识储备，以适应快速变化的社会需求。",
    reference: "In modern society, the concept of lifelong learning is receiving increasing attention. With the accelerating pace of knowledge renewal, relying solely on knowledge acquired in school is far from sufficient. Through online courses, vocational training, and various self-study methods, people can continuously update their knowledge base to adapt to rapidly changing social needs.",
    grammar: "'Is receiving increasing attention' — present continuous passive showing a growing trend. 'With + noun phrase' — introductory phrase for context. 'Relying solely on + noun' — gerund as subject. 'To adapt to + noun' — infinitive of purpose.",
    keywords: [
      { word: "lifelong learning", synonyms: ["continuous education", "ongoing learning", "permanent education"], note: "'Lifelong learning' is the standard modern term for education throughout one's life." },
      { word: "accelerating", synonyms: ["quickening", "fast-paced", "rapid"], note: "'Accelerating pace of change' is a high-frequency phrase in modern essays." }
    ],
    alternatives: [
      "The idea of continuous learning has gained significant traction in today's world. Given how quickly knowledge evolves, formal schooling can no longer provide all the tools needed for a successful career. Through online platforms, professional development programs, and independent study, individuals can continually refresh their skills to stay relevant in a dynamic society.",
      "Lifelong learning has become a necessity in the modern era. As the shelf life of knowledge shrinks, relying on what was learned in school is no longer adequate. Fortunately, online courses, vocational training, and self-directed learning offer flexible ways to keep pace with the demands of a rapidly evolving job market."
    ],
    difficulty: "CET-6"
  },
  {
    id: 50,
    type: "paragraph",
    source: "手机支付在中国已经非常普及，几乎覆盖了所有消费场景。从大型商场到街边小摊，从公共交通到网上购物，人们都可以使用手机完成支付。这种便捷的支付方式不仅提高了交易效率，也极大地改善了人们的生活体验。",
    reference: "Mobile payment has become very prevalent in China, covering almost all consumption scenarios. From large shopping malls to street stalls, from public transportation to online shopping, people can complete payments using their mobile phones. This convenient payment method has not only improved transaction efficiency but also greatly enhanced people's quality of life.",
    grammar: "'Has become + adjective' — present perfect indicating a completed change. 'From... to... from... to...' — comprehensive range structure. 'Has not only + past participle but also + past participle' — perfect parallel structure.",
    keywords: [
      { word: "prevalent", synonyms: ["ubiquitous", "widespread", "commonplace"], note: "'Prevalent' is formal. 'Ubiquitous' is stronger — meaning 'found everywhere'." },
      { word: "scenarios", synonyms: ["contexts", "settings", "situations"], note: "'Consumption scenarios' is a modern business term. 'Contexts' is more general." }
    ],
    alternatives: [
      "Mobile payments have become nearly universal in China, spanning virtually every spending context — from high-end retailers to street vendors, and from public transit to online shopping. This seamless payment ecosystem boosts transaction efficiency and significantly enhances everyday convenience.",
      "China has embraced mobile payments to a remarkable degree, with the technology now permeating every corner of daily commerce. Whether at a supermarket, a sidewalk stall, or on a bus, people can pay instantly with their phones. The convenience has streamlined countless transactions and enriched the overall consumer experience."
    ],
    difficulty: "CET-6"
  }
];
