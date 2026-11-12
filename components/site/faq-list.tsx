import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export function FaqList({
  items,
}: {
  items: readonly { question: string; answer: string }[]
}) {
  return (
    <div className="faq-list">
      <Accordion multiple>
        {items.map(({ question, answer }, index) => (
          <AccordionItem
            key={question}
            value={question}
            id={`question-${index + 1}`}
          >
            <AccordionTrigger>
              <span className="faq-question">{question}</span>
            </AccordionTrigger>
            <AccordionContent keepMounted>
              <p className="leading-relaxed text-pretty">{answer}</p>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}
