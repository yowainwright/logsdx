"use client";

import React, { useState } from "react";
import {
  SCHEMA_SECTIONS,
  MATCHING_PRIORITY,
  EXAMPLE_THEME,
  TEXT,
  CLASSES,
  STYLES,
} from "./constants";

type SchemaSectionData = (typeof SCHEMA_SECTIONS)[number];

function SchemaTabs({
  activeSection,
  onSelect,
}: {
  activeSection: number;
  onSelect: (index: number) => void;
}) {
  return (
    <div className={CLASSES.tabs.wrapper}>
      {SCHEMA_SECTIONS.map((item, index) => {
        const isActive = activeSection === index;
        const buttonClassName = `${CLASSES.tabs.button.base} ${
          isActive ? CLASSES.tabs.button.active : CLASSES.tabs.button.inactive
        }`;

        return (
          <button
            key={item.title}
            onClick={() => onSelect(index)}
            className={buttonClassName}
          >
            {item.title}
          </button>
        );
      })}
    </div>
  );
}

function SchemaProperties({
  properties,
}: {
  properties: SchemaSectionData["properties"];
}) {
  return (
    <div className={CLASSES.propertyList}>
      {properties.map((property) => (
        <div key={property.name} className={CLASSES.property.wrapper}>
          <div className={CLASSES.property.header}>
            <code className={CLASSES.property.name}>{property.name}</code>
            {property.required && (
              <span className={CLASSES.property.required}>
                {TEXT.labels.required}
              </span>
            )}
            <code className={CLASSES.property.type}>{property.type}</code>
          </div>
          <p className={CLASSES.property.description}>{property.description}</p>
          {property.example && (
            <code className={CLASSES.property.example}>{property.example}</code>
          )}
        </div>
      ))}
    </div>
  );
}

function SchemaSectionCard({ section }: { section: SchemaSectionData }) {
  return (
    <div className={CLASSES.card}>
      <h3 className={CLASSES.sectionTitle}>{section.title}</h3>
      <p className={CLASSES.sectionDescription}>{section.description}</p>
      <SchemaProperties properties={section.properties} />
    </div>
  );
}

function PriorityCard() {
  return (
    <div className={`mt-6 ${CLASSES.card}`}>
      <h4 className={CLASSES.sectionLabel}>{TEXT.labels.matchingPriority}</h4>
      <div className={CLASSES.priority.wrapper}>
        {MATCHING_PRIORITY.map((item, index) => (
          <div key={item.name} className={CLASSES.priority.item}>
            <span className={CLASSES.priority.number}>{index + 1}</span>
            <code className={CLASSES.priority.name}>{item.name}</code>
            <span className={CLASSES.priority.description}>
              {item.description}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ExampleTheme() {
  return (
    <div>
      <h4 className={CLASSES.sectionLabel}>{TEXT.labels.exampleTheme}</h4>
      <div className={CLASSES.terminal.wrapper}>
        <div className={CLASSES.terminal.header}>
          <div className={CLASSES.terminal.dots}>
            <div className={CLASSES.terminal.dot.red} />
            <div className={CLASSES.terminal.dot.yellow} />
            <div className={CLASSES.terminal.dot.green} />
          </div>
          <span className={CLASSES.terminal.title}>
            {TEXT.labels.themeJson}
          </span>
        </div>
        <pre className={CLASSES.terminal.content}>
          <code className={CLASSES.terminal.code}>{EXAMPLE_THEME}</code>
        </pre>
      </div>

      <div className={CLASSES.howMatching.wrapper}>
        <h4 className={CLASSES.howMatching.title}>{TEXT.labels.howMatching}</h4>
        <ol className={CLASSES.howMatching.list}>
          {TEXT.matchingSteps.map((step, index) => (
            <li key={index} className={CLASSES.howMatching.item}>
              <span className={CLASSES.howMatching.number}>{index + 1}.</span>
              {step}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

export function SchemaVisualization() {
  const [activeSection, setActiveSection] = useState(0);
  const section = SCHEMA_SECTIONS[activeSection];

  return (
    <section id="schema" className={CLASSES.section}>
      <div className={CLASSES.container}>
        <div className={CLASSES.wrapper}>
          <h2
            className={CLASSES.header.title}
            style={{ filter: STYLES.headerDropShadow }}
          >
            <span className={CLASSES.header.gradient}>
              {TEXT.title.highlight}
            </span>{" "}
            {TEXT.title.rest}
          </h2>
          <p className={CLASSES.header.description}>{TEXT.description}</p>

          <div className={CLASSES.grid}>
            <div>
              <SchemaTabs
                activeSection={activeSection}
                onSelect={setActiveSection}
              />
              <SchemaSectionCard section={section} />
              <PriorityCard />
            </div>
            <ExampleTheme />
          </div>
        </div>
      </div>
    </section>
  );
}

export type { SchemaSection, SchemaProperty } from "./types";
