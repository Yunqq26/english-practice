// ===== 专题练习题库 =====
// 每个题目包含 grammarPoints 用于分析中高亮知识点

const TOPICS = [
  {
    id: "attr-clause",
    name: "定语从句",
    icon: "🔗",
    desc: "关系代词 who/which/that/whom 引导的定语从句",
    questions: [
      {
        id: 101, type: "topic",
        source: "我昨天买的书非常有趣。",
        reference: "The book that I bought yesterday is very interesting.",
        grammar: "定语从句由关系代词 that 引导，修饰先行词 the book。在从句中 that 作 bought 的宾语，可以省略。",
        grammarPoints: [
          { name: "关系代词 that", detail: "指物，在从句中作宾语时可省略", used: true },
          { name: "先行词", detail: "被定语从句修饰的名词 the book", used: true },
          { name: "从句语序", detail: "定语从句用陈述语序: I bought yesterday", used: true }
        ],
        keywords: [
          { word: "bought", synonyms: ["purchased"], note: "buy 的过去式，表示'购买'" },
          { word: "interesting", synonyms: ["fascinating", "engaging"], note: "'有趣的'，形容事物" },
          { word: "yesterday", synonyms: [], note: "'昨天'，时间状语" }
        ],
        alternatives: [
          "The book which I bought yesterday is very fascinating.",
          "The book I bought yesterday is very interesting."
        ],
        difficulty: "CET-4"
      },
      {
        id: 102, type: "topic",
        source: "站在那边的女孩是我的妹妹。",
        reference: "The girl who is standing over there is my sister.",
        grammar: "定语从句由关系代词 who 引导，修饰先行词 the girl。who 在从句中作主语，不能省略。",
        grammarPoints: [
          { name: "关系代词 who", detail: "指人，在从句中作主语时不可省略", used: true },
          { name: "先行词", detail: "被修饰的名词 the girl", used: true },
          { name: "主谓一致", detail: "关系代词 who 指代 the girl，从句动词用 is", used: true }
        ],
        keywords: [
          { word: "standing", synonyms: ["sitting", "lying"], note: "stand 的现在分词，'站着的'" },
          { word: "over there", synonyms: [], note: "'在那边'，地点状语" }
        ],
        alternatives: [
          "The girl standing over there is my sister.",
          "The girl that is standing over there is my sister."
        ],
        difficulty: "CET-4"
      },
      {
        id: 103, type: "topic",
        source: "这是我曾经工作过的那家公司。",
        reference: "This is the company where I used to work.",
        grammar: "定语从句由关系副词 where 引导，修饰先行词 the company。where 在从句中作地点状语，相当于 in which。",
        grammarPoints: [
          { name: "关系副词 where", detail: "指地点，在从句中作地点状语 = in/at which", used: true },
          { name: "used to", detail: "'过去常常'，表示过去习惯性动作", used: true },
          { name: "先行词 the company", detail: "被定语从句修饰的地点名词", used: true }
        ],
        keywords: [
          { word: "company", synonyms: ["corporation", "firm"], note: "'公司'" },
          { word: "used to", synonyms: ["would"], note: "'过去常常'，后接动词原形" }
        ],
        alternatives: [
          "This is the company in which I used to work.",
          "This is the company that I used to work for."
        ],
        difficulty: "CET-4"
      },
      {
        id: 104, type: "topic",
        source: "他考试通过了，这让大家都很高兴。",
        reference: "He passed the exam, which made everyone very happy.",
        grammar: "非限制性定语从句用 which 引导，修饰前面整个句子。非限制性定语从句用逗号隔开，不能用 that 替换。",
        grammarPoints: [
          { name: "非限制性定语从句", detail: "修饰整句话，用逗号隔开，不能用 that", used: true },
          { name: "关系代词 which", detail: "指代前面整个句子，作主语", used: true },
          { name: "逗号分隔", detail: "非限制性定语从句必须用逗号与主句隔开", used: true }
        ],
        keywords: [
          { word: "passed", synonyms: ["aced"], note: "pass 的过去式，'通过（考试）'" },
          { word: "exam", synonyms: ["test", "examination"], note: "'考试'" },
          { word: "everyone", synonyms: ["everybody"], note: "'每个人'" }
        ],
        alternatives: [
          "He passed the exam, which made everybody very happy.",
          "He passed the examination, which delighted everyone."
        ],
        difficulty: "CET-6"
      },
      {
        id: 105, type: "topic",
        source: "这就是我们一直在找的那个人。",
        reference: "This is the person whom we have been looking for.",
        grammar: "定语从句由关系代词 whom 引导，修饰先行词 the person。whom 在从句中作介词 for 的宾语，正式语体中常用。",
        grammarPoints: [
          { name: "关系代词 whom", detail: "指人，在从句中作宾语（正式用法）", used: true },
          { name: "介词宾语", detail: "whom 作介词 for 的宾语，介词可提前", used: true },
          { name: "完成进行时", detail: "have been looking 表示从过去持续到现在的动作", used: true }
        ],
        keywords: [
          { word: "person", synonyms: ["individual", "guy"], note: "'人'" },
          { word: "looking for", synonyms: ["searching for", "seeking"], note: "'寻找'" }
        ],
        alternatives: [
          "This is the person who we have been looking for.",
          "This is the person for whom we have been looking."
        ],
        difficulty: "CET-6"
      }
    ]
  },
  {
    id: "adv-clause",
    name: "状语从句",
    icon: "⏱️",
    desc: "时间/原因/条件/让步/目的状语从句",
    questions: [
      {
        id: 201, type: "topic",
        source: "虽然他很努力，但还是没通过考试。",
        reference: "Although he worked very hard, he still didn't pass the exam.",
        grammar: "although 引导让步状语从句，表示'虽然…但是…'。注意英语中 although 和 but 不能同时使用。",
        grammarPoints: [
          { name: "让步状语从句", detail: "although/though 引导，表示'虽然'", used: true },
          { name: "连词不并用", detail: "although 和 but 不能同时出现在一个句子中", used: true },
          { name: "still 用法", detail: "在主句中用 still 表示'仍然'，加强转折语气", used: true }
        ],
        keywords: [
          { word: "Although", synonyms: ["Though", "Even though"], note: "'虽然'，引导让步状语从句" },
          { word: "worked hard", synonyms: ["studied hard", "strived"], note: "'努力学习'" },
          { word: "pass", synonyms: ["ace"], note: "'通过'" }
        ],
        alternatives: [
          "Though he worked very hard, he still failed the exam.",
          "He worked very hard, but he still didn't pass the exam."
        ],
        difficulty: "CET-4"
      },
      {
        id: 202, type: "topic",
        source: "如果明天下雨，比赛就会取消。",
        reference: "If it rains tomorrow, the match will be cancelled.",
        grammar: "if 引导条件状语从句，遵循'主将从现'原则：从句用一般现在时 rains，主句用一般将来时 will be cancelled。",
        grammarPoints: [
          { name: "条件状语从句", detail: "if 引导，表示'如果'", used: true },
          { name: "主将从现", detail: "从句用一般现在时，主句用一般将来时", used: true },
          { name: "被动语态", detail: "will be cancelled 是将来时的被动语态", used: true }
        ],
        keywords: [
          { word: "rains", synonyms: [], note: "rain 的第三人称单数，从句用一般现在时表将来" },
          { word: "match", synonyms: ["game", "competition"], note: "'比赛'" },
          { word: "cancelled", synonyms: ["called off"], note: "'取消'" }
        ],
        alternatives: [
          "If it rains tomorrow, the game will be called off.",
          "Should it rain tomorrow, the match will be cancelled."
        ],
        difficulty: "CET-4"
      },
      {
        id: 203, type: "topic",
        source: "她因为迟到了，所以向老师道了歉。",
        reference: "She apologized to the teacher because she was late.",
        grammar: "because 引导原因状语从句，直接说明因果关系。because 引导的从句通常放在主句后面，也可以放在前面。",
        grammarPoints: [
          { name: "原因状语从句", detail: "because 引导，表示直接原因", used: true },
          { name: "apologize to", detail: "'向某人道歉'，固定搭配", used: true },
          { name: "because vs since", detail: "because 表示直接原因，since 表示已知原因", used: true }
        ],
        keywords: [
          { word: "apologized", synonyms: ["said sorry"], note: "apologize 的过去式，'道歉'" },
          { word: "teacher", synonyms: ["instructor"], note: "'老师'" },
          { word: "late", synonyms: ["not on time"], note: "'迟到的'" }
        ],
        alternatives: [
          "Because she was late, she apologized to the teacher.",
          "She said sorry to the teacher for being late."
        ],
        difficulty: "CET-4"
      }
    ]
  },
  {
    id: "noun-clause",
    name: "名词性从句",
    icon: "💬",
    desc: "主语从句/宾语从句/表语从句/同位语从句",
    questions: [
      {
        id: 301, type: "topic",
        source: "众所周知，吸烟有害健康。",
        reference: "It is well known that smoking is harmful to health.",
        grammar: "that 引导主语从句，it 作形式主语。真正的主语是 that smoking is harmful to health，放在句末避免头重脚轻。",
        grammarPoints: [
          { name: "主语从句", detail: "that 从句作主语，it 作形式主语", used: true },
          { name: "形式主语 it", detail: "it 代替真正的主语放在句首", used: true },
          { name: "固定句型", detail: "It is well known that... = '众所周知'" , used: true }
        ],
        keywords: [
          { word: "well known", synonyms: ["widely known", "common knowledge"], note: "'众所周知的'" },
          { word: "smoking", synonyms: [], note: "smoke 的动名词，'吸烟'" },
          { word: "harmful", synonyms: ["damaging", "detrimental"], note: "'有害的'" }
        ],
        alternatives: [
          "That smoking is harmful to health is well known.",
          "It is common knowledge that smoking damages health."
        ],
        difficulty: "CET-6"
      },
      {
        id: 302, type: "topic",
        source: "我不知道他什么时候回来。",
        reference: "I don't know when he will come back.",
        grammar: "when 引导宾语从句，作 know 的宾语。宾语从句用陈述语序 he will come back，不是疑问语序 will he come back。",
        grammarPoints: [
          { name: "宾语从句", detail: "when 引导的从句作 know 的宾语", used: true },
          { name: "陈述语序", detail: "宾语从句必须用陈述语序，不是疑问语序", used: true },
          { name: "连接副词 when", detail: "在从句中作时间状语", used: true }
        ],
        keywords: [
          { word: "know", synonyms: ["understand", "tell"], note: "'知道'" },
          { word: "come back", synonyms: ["return"], note: "'回来'" }
        ],
        alternatives: [
          "I have no idea when he will come back.",
          "I don't know when he is coming back."
        ],
        difficulty: "CET-4"
      },
      {
        id: 303, type: "topic",
        source: "问题是我们是否应该接受这个提议。",
        reference: "The question is whether we should accept the proposal.",
        grammar: "whether 引导表语从句，放在系动词 is 后面作表语。whether 表示'是否'，与 or not 连用时可换成 if。",
        grammarPoints: [
          { name: "表语从句", detail: "whether 从句放在系动词后作表语", used: true },
          { name: "whether vs if", detail: "表语从句中只能用 whether，不能用 if", used: true },
          { name: "should 的用法", detail: "表示'应该'，提建议的语气", used: true }
        ],
        keywords: [
          { word: "whether", synonyms: ["if"], note: "'是否'，表语从句中不能用 if 替换" },
          { word: "accept", synonyms: ["agree to"], note: "'接受'" },
          { word: "proposal", synonyms: ["suggestion", "offer"], note: "'提议，提案'" }
        ],
        alternatives: [
          "The question is whether we should agree to the proposal.",
          "Whether we should accept the proposal is the question."
        ],
        difficulty: "CET-6"
      }
    ]
  },
  {
    id: "subjunctive",
    name: "虚拟语气",
    icon: "🎭",
    desc: "与事实相反的假设，用虚拟语气表达",
    questions: [
      {
        id: 401, type: "topic",
        source: "如果我是你，我就会接受那个工作。",
        reference: "If I were you, I would accept that job.",
        grammar: "与现在事实相反的虚拟语气：从句用 if I were（不用 was），主句用 would + 动词原形。were 是虚拟语气的标志。",
        grammarPoints: [
          { name: "与现在相反", detail: "从句用一般过去时(be 用 were)，主句用 would + do", used: true },
          { name: "if I were", detail: "虚拟语气中 be 动词一律用 were，不用 was", used: true },
          { name: "would + do", detail: "主句用 would + 动词原形表示虚拟结果", used: true }
        ],
        keywords: [
          { word: "were", synonyms: [], note: "虚拟语气中 be 动词用 were，不是 was" },
          { word: "would accept", synonyms: [], note: "主句用 would + 动词原形" },
          { word: "job", synonyms: ["position", "offer"], note: "'工作'" }
        ],
        alternatives: [
          "If I were you, I'd take that job.",
          "Were I you, I would accept that job."
        ],
        difficulty: "CET-6"
      },
      {
        id: 402, type: "topic",
        source: "要是昨天我知道这个消息，我就会来了。",
        reference: "If I had known the news yesterday, I would have come.",
        grammar: "与过去事实相反的虚拟语气：从句用 had + 过去分词，主句用 would have + 过去分词。表示对已发生事情的假设。",
        grammarPoints: [
          { name: "与过去相反", detail: "从句用 had + done，主句用 would have + done", used: true },
          { name: "had known", detail: "对过去的假设，从句用过去完成时", used: true },
          { name: "would have come", detail: "主句用 would have + 过去分词", used: true }
        ],
        keywords: [
          { word: "had known", synonyms: ["had been aware"], note: "虚拟语气中表示'如果知道'" },
          { word: "news", synonyms: ["information", "message"], note: "'消息'" },
          { word: "would have come", synonyms: [], note: "'就会来'，虚拟语气主句形式" }
        ],
        alternatives: [
          "Had I known the news yesterday, I would have come.",
          "If I had known about it yesterday, I would have shown up."
        ],
        difficulty: "CET-6"
      },
      {
        id: 403, type: "topic",
        source: "老师建议他每天练习英语。",
        reference: "The teacher suggested that he practice English every day.",
        grammar: "suggest 等表示'建议/要求/命令'的动词后的 that 从句用虚拟语气：(should) + 动词原形。practice 用原形不加 s。",
        grammarPoints: [
          { name: "suggest 虚拟", detail: "suggest/advise/recommend 后 that 从句用(should) do", used: true },
          { name: "动词原形", detail: "he practice（不加 s），虚拟语气中不论人称都用原形", used: true },
          { name: "should 省略", detail: "表示建议的虚拟语气中 should 可以省略", used: true }
        ],
        keywords: [
          { word: "suggested", synonyms: ["recommended", "advised"], note: "'建议'，后接虚拟语气" },
          { word: "practice", synonyms: ["work on"], note: "'练习'，suggest 后用原形" },
          { word: "every day", synonyms: ["daily"], note: "'每天'，时间状语" }
        ],
        alternatives: [
          "The teacher recommended that he practice English daily.",
          "The teacher suggested that he should practice English every day."
        ],
        difficulty: "CET-6"
      }
    ]
  },
  {
    id: "passive",
    name: "被动语态",
    icon: "🔄",
    desc: "各种时态的被动语态 be + 过去分词",
    questions: [
      {
        id: 501, type: "topic",
        source: "这座桥是去年建造的。",
        reference: "This bridge was built last year.",
        grammar: "一般过去时的被动语态：was/were + 过去分词。built 是 build 的过去分词，动作的承受者 this bridge 作主语。",
        grammarPoints: [
          { name: "一般过去被动", detail: "was/were + 过去分词，表示过去发生的被动动作", used: true },
          { name: "过去分词", detail: "build → built，不规则变化", used: true },
          { name: "动作承受者作主语", detail: "桥是被建造的，所以用被动语态", used: true }
        ],
        keywords: [
          { word: "was built", synonyms: ["was constructed", "was erected"], note: "'被建造'，被动语态" },
          { word: "bridge", synonyms: [], note: "'桥'" },
          { word: "last year", synonyms: [], note: "'去年'，过去时间状语" }
        ],
        alternatives: [
          "This bridge was constructed last year.",
          "The construction of this bridge was completed last year."
        ],
        difficulty: "CET-4"
      },
      {
        id: 502, type: "topic",
        source: "这些问题需要在会议上讨论。",
        reference: "These problems need to be discussed at the meeting.",
        grammar: "need to be + 过去分词，表示'需要被…'，是不定式的被动形式。也可以换成 need discussing（主动形式表被动含义）。",
        grammarPoints: [
          { name: "不定式被动", detail: "to be + 过去分词，表示'需要被做'" , used: true },
          { name: "need doing", detail: "need discussing = need to be discussed，主动表被动", used: true },
          { name: "介词 at", detail: "at the meeting '在会上'，固定搭配", used: true }
        ],
        keywords: [
          { word: "need to be discussed", synonyms: ["need discussing"], note: "'需要被讨论'" },
          { word: "problems", synonyms: ["issues", "matters"], note: "'问题'" },
          { word: "meeting", synonyms: ["conference"], note: "'会议'" }
        ],
        alternatives: [
          "These problems need discussing at the meeting.",
          "These issues need to be talked about at the meeting."
        ],
        difficulty: "CET-6"
      }
    ]
  },
  {
    id: "non-finite",
    name: "非谓语动词",
    icon: "✏️",
    desc: "不定式/动名词/分词的用法",
    questions: [
      {
        id: 601, type: "topic",
        source: "学英语最好的方法是多练习。",
        reference: "The best way to learn English is to practice a lot.",
        grammar: "不定式 to learn 作定语修饰 way，不定式 to practice 作表语。不定式在句中充当名词、形容词、副词的作用。",
        grammarPoints: [
          { name: "不定式作定语", detail: "to learn 修饰 way，'学英语的方式'", used: true },
          { name: "不定式作表语", detail: "to practice 放在 is 后作表语", used: true },
          { name: "the best way to", detail: "固定搭配，'做…最好的方法'", used: true }
        ],
        keywords: [
          { word: "way to learn", synonyms: ["method of learning"], note: "'学…的方法'" },
          { word: "practice", synonyms: ["exercise"], note: "'练习'" },
          { word: "a lot", synonyms: ["a great deal"], note: "'大量地'" }
        ],
        alternatives: [
          "The best method of learning English is practicing a lot.",
          "Practicing a lot is the best way to learn English."
        ],
        difficulty: "CET-4"
      },
      {
        id: 602, type: "topic",
        source: "他坐在椅子上，看着窗外。",
        reference: "He sat in the chair, looking out of the window.",
        grammar: "现在分词 looking 作伴随状语，表示与谓语同时发生的动作。现在分词 looking 的逻辑主语是主句主语 he。",
        grammarPoints: [
          { name: "现在分词作伴随状语", detail: "looking 表示与 sat 同时发生的伴随动作", used: true },
          { name: "逻辑主语一致", detail: "looking 的逻辑主语与主句主语 he 一致", used: true },
          { name: "分词作状语", detail: "现在分词表主动，过去分词表被动", used: true }
        ],
        keywords: [
          { word: "sat", synonyms: ["was sitting"], note: "sit 的过去式，'坐'" },
          { word: "chair", synonyms: ["seat"], note: "'椅子'" },
          { word: "looking out", synonyms: ["gazing out"], note: "'向外看'" }
        ],
        alternatives: [
          "He sat in the chair and looked out of the window.",
          "Sitting in the chair, he looked out of the window."
        ],
        difficulty: "CET-6"
      }
    ]
  },
  {
    id: "inversion",
    name: "倒装句",
    icon: "↔️",
    desc: "完全倒装和部分倒装的结构",
    questions: [
      {
        id: 701, type: "topic",
        source: "直到他回到家，他才意识到丢了钱包。",
        reference: "Not until he got home did he realize he had lost his wallet.",
        grammar: "Not until 放在句首时，主句用部分倒装：did + 主语 + 动词原形。until 从句本身不倒装。",
        grammarPoints: [
          { name: "not until 倒装", detail: "not until 放句首，主句倒装", used: true },
          { name: "部分倒装", detail: "did + 主语 + realize，助动词提前", used: true },
          { name: "过去完成时", detail: "had lost 发生在 realized 之前", used: true }
        ],
        keywords: [
          { word: "Not until", synonyms: ["Only when"], note: "'直到…才'，放句首主句倒装" },
          { word: "got home", synonyms: ["arrived home"], note: "'到家'" },
          { word: "realize", synonyms: ["notice"], note: "'意识到'" },
          { word: "wallet", synonyms: ["purse"], note: "'钱包'" }
        ],
        alternatives: [
          "Only when he got home did he realize he had lost his wallet.",
          "He didn't realize he had lost his wallet until he got home."
        ],
        difficulty: "CET-6"
      },
      {
        id: 702, type: "topic",
        source: "只有通过努力工作，你才能成功。",
        reference: "Only by working hard can you succeed.",
        grammar: "'Only + 介词短语' 放在句首时，主句用部分倒装：can + 主语 + 动词原形。这是典型的强调性倒装结构。",
        grammarPoints: [
          { name: "only 倒装", detail: "only + 状语放句首，主句倒装", used: true },
          { name: "情态动词提前", detail: "can 提到主语 you 前面", used: true },
          { name: "by doing", detail: "by working hard '通过努力工作'，方式状语", used: true }
        ],
        keywords: [
          { word: "Only by", synonyms: ["Only through"], note: "'只有通过'，放句首倒装" },
          { word: "working hard", synonyms: ["striving"], note: "'努力工作'" },
          { word: "succeed", synonyms: ["achieve success"], note: "'成功'" }
        ],
        alternatives: [
          "You can succeed only by working hard.",
          "Only through hard work can you succeed."
        ],
        difficulty: "CET-6"
      }
    ]
  },
  {
    id: "tenses",
    name: "时态",
    icon: "⏰",
    desc: "完成时/进行时/完成进行时的综合运用",
    questions: [
      {
        id: 801, type: "topic",
        source: "我在这家公司已经工作了五年。",
        reference: "I have been working in this company for five years.",
        grammar: "现在完成进行时 have been + 现在分词，强调动作从过去开始持续到现在，并且可能继续下去。for + 时间段是一起使用的标志。",
        grammarPoints: [
          { name: "现在完成进行时", detail: "have been + doing，表示持续到现在的动作", used: true },
          { name: "for + 时间段", detail: "for five years 表示动作持续了五年", used: true },
          { name: "与完成时的区别", detail: "完成进行时强调持续，完成时强调结果", used: true }
        ],
        keywords: [
          { word: "have been working", synonyms: ["have worked"], note: "'一直在工作'，完成进行时" },
          { word: "company", synonyms: ["corporation", "firm"], note: "'公司'" },
          { word: "for five years", synonyms: [], note: "'五年了'，时间段" }
        ],
        alternatives: [
          "I have worked in this company for five years.",
          "I have been employed by this company for five years."
        ],
        difficulty: "CET-4"
      },
      {
        id: 802, type: "topic",
        source: "到我毕业的时候，我已经学了十年英语了。",
        reference: "By the time I graduate, I will have studied English for ten years.",
        grammar: "将来完成时 will have + 过去分词，表示在将来某个时间点之前已经完成的动作。by the time '到…时候' 是标志词。",
        grammarPoints: [
          { name: "将来完成时", detail: "will have + 过去分词，表示将来某时已完成的动作", used: true },
          { name: "by the time", detail: "'到…时'，引导时间状语从句", used: true },
          { name: "从句用一般现在", detail: "时间状语从句中一般现在时表将来", used: true }
        ],
        keywords: [
          { word: "By the time", synonyms: [], note: "'到…时候'，完成时标志词" },
          { word: "graduate", synonyms: ["finish school"], note: "'毕业'" },
          { word: "will have studied", synonyms: [], note: "'将已经学了'，将来完成时" }
        ],
        alternatives: [
          "When I graduate, I will have been studying English for ten years.",
          "By graduation, I will have studied English for ten years."
        ],
        difficulty: "CET-6"
      },
      {
        id: 803, type: "topic",
        source: "我正要出门这时电话响了。",
        reference: "I was about to go out when the phone rang.",
        grammar: "be about to do...when... 表示'正要…这时突然…'，用过去时态叙述过去发生的事情。when 表示'这时突然'。",
        grammarPoints: [
          { name: "be about to do", detail: "'正要做某事'，表示即将发生的动作", used: true },
          { name: "when 特殊用法", detail: "when 表示'这时突然'，连接意外事件", used: true },
          { name: "一般过去时", detail: "rang 表示过去发生的突然动作", used: true }
        ],
        keywords: [
          { word: "was about to", synonyms: ["was going to"], note: "'正打算'" },
          { word: "go out", synonyms: ["leave"], note: "'出门'" },
          { word: "rang", synonyms: [], note: "ring 的过去式，'（电话）响了'" }
        ],
        alternatives: [
          "I was just about to leave when the phone rang.",
          "I was on the point of going out when the phone rang."
        ],
        difficulty: "CET-6"
      }
    ]
  }
];

// 获取所有专题
function getAllTopics() {
  return TOPICS;
}

// 根据专题 ID 获取题目
function getTopicQuestions(topicId) {
  const topic = TOPICS.find(t => t.id === topicId);
  return topic ? topic.questions : [];
}
