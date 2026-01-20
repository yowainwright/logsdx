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
              <div className={CLASSES.tabs.wrapper}>
                {SCHEMA_SECTIONS.map((s, i) => (
                  <button
                    key={s.title}
                    onClick={() => setActiveSection(i)}
                    className={`${CLASSES.tabs.button.base} ${
                      activeSection === i
                        ? CLASSES.tabs.button.active
                        : CLASSES.tabs.button.inactive
                    }`}
                  >
                    {s.title}
                  </button>
                ))}
              </div>

              <div className={CLASSES.card}>
                <h3 className={CLASSES.sectionTitle}>{section.title}</h3>
                <p className={CLASSES.sectionDescription}>
                  {section.description}
                </p>

                <div className={CLASSES.propertyList}>
                  {section.properties.map((prop) => (
                    <div key={prop.name} className={CLASSES.property.wrapper}>
                      <div className={CLASSES.property.header}>
                        <code className={CLASSES.property.name}>
                          {prop.name}
                        </code>
                        {prop.required && (
                          <span className={CLASSES.property.required}>
                            {TEXT.labels.required}
                          </span>
                        )}
                        <code className={CLASSES.property.type}>
                          {prop.type}
                        </code>
                      </div>
                      <p className={CLASSES.property.description}>
                        {prop.description}
                      </p>
                      {prop.example && (
                        <code className={CLASSES.property.example}>
                          {prop.example}
                        </code>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className={`mt-6 ${CLASSES.card}`}>
                <h4 className={CLASSES.sectionLabel}>
                  {TEXT.labels.matchingPriority}
                </h4>
                <div className={CLASSES.priority.wrapper}>
                  {MATCHING_PRIORITY.map((item, i) => (
                    <div key={item.name} className={CLASSES.priority.item}>
                      <span className={CLASSES.priority.number}>{i + 1}</span>
                      <code className={CLASSES.priority.name}>{item.name}</code>
                      <span className={CLASSES.priority.description}>
                        {item.description}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <h4 className={CLASSES.sectionLabel}>
                {TEXT.labels.exampleTheme}
              </h4>
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
                <h4 className={CLASSES.howMatching.title}>
                  {TEXT.labels.howMatching}
                </h4>
                <ol className={CLASSES.howMatching.list}>
                  {TEXT.matchingSteps.map((step, i) => (
                    <li key={i} className={CLASSES.howMatching.item}>
                      <span className={CLASSES.howMatching.number}>
                        {i + 1}.
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export type { SchemaSection, SchemaProperty } from "./types";
