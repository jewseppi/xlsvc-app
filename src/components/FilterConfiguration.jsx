import React from "react";
import styled from "styled-components";
import { Button, Input, Label } from "../styled/BaseComponents";
import CollapsibleSection from "./CollapsibleSection";

const FilterConfigContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.md};
`;

const FilterRule = styled.div`
  background: ${(props) => props.theme.colors.background.secondary};
  border: 2px solid ${(props) => props.theme.colors.border.primary};
  border-radius: ${(props) => props.theme.borderRadius.lg};
  padding: ${(props) => props.theme.spacing.lg};
  transition: ${(props) => props.theme.transitions.normal};

  &:hover {
    border-color: ${(props) => props.theme.colors.border.secondary};
  }
`;

const FilterRuleGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: ${(props) => props.theme.spacing.md};
  align-items: end;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormField = styled.div`
  display: flex;
  flex-direction: column;
`;

const RemoveButton = styled(Button)`
  padding: ${(props) => props.theme.spacing.md};
  min-width: 40px;
  background: ${(props) => props.theme.colors.accent.error};

  &:hover:not(:disabled) {
    background: #dc2626;
  }
`;

const AddButton = styled(Button)`
  width: 100%;
  background: transparent;
  border: 2px dashed ${(props) => props.theme.colors.accent.primary};
  color: ${(props) => props.theme.colors.accent.primary};

  &:hover:not(:disabled) {
    background: ${(props) => props.theme.colors.accent.primary}22;
    border-style: solid;
  }
`;

const InfoBox = styled.div`
  margin-top: ${(props) => props.theme.spacing.lg};
  padding: ${(props) => props.theme.spacing.lg};
  background: ${(props) => props.theme.colors.background.secondary};
  border-radius: ${(props) => props.theme.borderRadius.md};
  border: 1px solid ${(props) => props.theme.colors.border.primary};
`;

const InfoTitle = styled.h4`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${(props) => props.theme.colors.text.primary};
  margin-bottom: ${(props) => props.theme.spacing.sm};
`;

const InfoText = styled.p`
  font-size: 0.875rem;
  color: ${(props) => props.theme.colors.text.secondary};
  line-height: 1.5;
  margin: 0;

  strong {
    color: ${(props) => props.theme.colors.text.primary};
  }
`;

const ColumnRemoveRow = styled.div`
  display: flex;
  gap: ${(props) => props.theme.spacing.md};
  align-items: end;
`;

function FilterConfiguration({
  filterRules,
  setFilterRules,
  columnsToRemove,
  setColumnsToRemove,
  columnRange,
  setColumnRange,
  sheetsToRemove,
  setSheetsToRemove,
}) {
  const addFilterRule = () => {
    setFilterRules([...filterRules, { column: "A", value: "0" }]);
  };

  const removeFilterRule = (index) => {
    setFilterRules(filterRules.filter((_, i) => i !== index));
  };

  const updateFilterRule = (index, field, value) => {
    const updated = [...filterRules];
    updated[index][field] = value;
    setFilterRules(updated);
  };

  return (
    <FilterConfigContainer>
      <CollapsibleSection title="Row filters (empty / zero)" defaultOpen>
        {filterRules.map((rule, index) => (
          <FilterRule key={index}>
            <FilterRuleGrid>
              <FormField>
                <Label htmlFor={`column-${index}`}>Column</Label>
                <Input
                  id={`column-${index}`}
                  type="text"
                  value={rule.column}
                  onChange={(e) =>
                    updateFilterRule(index, "column", e.target.value.toUpperCase())
                  }
                  placeholder="F"
                />
              </FormField>

              <FormField>
                <Label htmlFor={`value-${index}`}>Value to Match</Label>
                <Input
                  id={`value-${index}`}
                  type="text"
                  value={rule.value}
                  onChange={(e) => updateFilterRule(index, "value", e.target.value)}
                  placeholder="0"
                />
              </FormField>

              <RemoveButton
                variant="danger"
                onClick={() => removeFilterRule(index)}
                aria-label="Remove filter rule"
              >
                ✕
              </RemoveButton>
            </FilterRuleGrid>
          </FilterRule>
        ))}

        <AddButton variant="ghost" onClick={addFilterRule}>
          + Add Filter Rule
        </AddButton>

        <InfoBox>
          <InfoTitle>How it works</InfoTitle>
          <InfoText>
            Rows will be <strong>deleted</strong> if <strong>ALL</strong> filter
            rules match (AND logic).
            <br />
            <br />
            All rules check for <strong>empty or zero</strong> values: matches
            empty cells, cells with 0, "0", or whitespace.
            <br />
            <br />
            Rows with an empty Column A are <strong>skipped</strong> (not evaluated).
            <br />
            <br />
            Column can be a letter (A, F, Z) or number (1, 6, 26).
          </InfoText>
        </InfoBox>
      </CollapsibleSection>

      {columnsToRemove && setColumnsToRemove && (
        <CollapsibleSection title="Columns to Remove" defaultOpen>
          <InfoText style={{ marginBottom: "0.5rem" }}>
            Entire columns removed regardless of content (after row deletion).
          </InfoText>
          {columnsToRemove.map((col, idx) => (
            <FilterRule key={idx} style={{ marginBottom: "0.5rem" }}>
              <ColumnRemoveRow>
                <FormField>
                  <Label htmlFor={`remove-col-${idx}`}>Column</Label>
                  <Input
                    id={`remove-col-${idx}`}
                    type="text"
                    value={col}
                    onChange={(e) => {
                      const updated = [...columnsToRemove];
                      updated[idx] = e.target.value.toUpperCase();
                      setColumnsToRemove(updated);
                    }}
                    placeholder="A"
                  />
                </FormField>
                <RemoveButton
                  variant="danger"
                  onClick={() =>
                    setColumnsToRemove(columnsToRemove.filter((_, i) => i !== idx))
                  }
                  aria-label="Remove column entry"
                >
                  ✕
                </RemoveButton>
              </ColumnRemoveRow>
            </FilterRule>
          ))}
          <AddButton variant="ghost" onClick={() => setColumnsToRemove([...columnsToRemove, ""])}>
            + Add Column to Remove
          </AddButton>
        </CollapsibleSection>
      )}

      {setColumnRange && (
        <CollapsibleSection title="Column Range to Remove">
          <InfoText style={{ marginBottom: "0.5rem" }}>
            Remove a range or list of columns. Examples: <strong>A-Z</strong> or{" "}
            <strong>A, B, C, D</strong>. Spacing and casing don't matter.
          </InfoText>
          <Label htmlFor="column-range">Range or list</Label>
          <Input
            id="column-range"
            type="text"
            value={columnRange || ""}
            onChange={(e) => setColumnRange(e.target.value)}
            placeholder="A-Z or A, B, C"
          />
        </CollapsibleSection>
      )}

      {setSheetsToRemove && (
        <CollapsibleSection title="Remove Sheets / Tabs">
          <InfoText style={{ marginBottom: "0.5rem" }}>
            Remove entire sheets by name or position (1 = first tab). Examples:{" "}
            <strong>Summary, 3</strong>. Casing doesn't matter.
          </InfoText>
          <Label htmlFor="sheets-to-remove">Sheet names or numbers</Label>
          <Input
            id="sheets-to-remove"
            type="text"
            value={sheetsToRemove || ""}
            onChange={(e) => setSheetsToRemove(e.target.value)}
            placeholder="Summary, 3"
          />
        </CollapsibleSection>
      )}
    </FilterConfigContainer>
  );
}

export default FilterConfiguration;
