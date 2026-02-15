import React, { useState } from "react";
import styled from "styled-components";
import { Button, Input, Label } from "../styled/BaseComponents";

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

const ColumnsToRemoveSection = styled.div`
  margin-top: ${(props) => props.theme.spacing.lg};
  padding: ${(props) => props.theme.spacing.lg};
  background: ${(props) => props.theme.colors.background.secondary};
  border: 2px solid ${(props) => props.theme.colors.border.primary};
  border-radius: ${(props) => props.theme.borderRadius.lg};
`;

const ColumnsToRemoveTitle = styled.h4`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${(props) => props.theme.colors.text.primary};
  margin-bottom: ${(props) => props.theme.spacing.sm};
`;

const ColumnTagList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${(props) => props.theme.spacing.sm};
  margin-top: ${(props) => props.theme.spacing.sm};
`;

const ColumnTag = styled.span`
  display: inline-flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.xs};
  padding: ${(props) => props.theme.spacing.xs} ${(props) => props.theme.spacing.md};
  background: ${(props) => props.theme.colors.accent.primary}22;
  border: 1px solid ${(props) => props.theme.colors.accent.primary};
  border-radius: ${(props) => props.theme.borderRadius.md};
  font-size: 0.8rem;
  color: ${(props) => props.theme.colors.text.primary};
`;

const ColumnTagRemove = styled.button`
  background: none;
  border: none;
  color: ${(props) => props.theme.colors.accent.error};
  cursor: pointer;
  font-size: 0.9rem;
  padding: 0;
  line-height: 1;
`;

const AddColumnRow = styled.div`
  display: flex;
  gap: ${(props) => props.theme.spacing.sm};
  margin-top: ${(props) => props.theme.spacing.sm};
  align-items: end;
`;

function FilterConfiguration({ filterRules, setFilterRules, columnsToRemove, setColumnsToRemove }) {
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
                  updateFilterRule(
                    index,
                    "column",
                    e.target.value.toUpperCase()
                  )
                }
                placeholder="e.g., F or 6"
              />
            </FormField>

            <FormField>
              <Label htmlFor={`value-${index}`}>Value to Match</Label>
              <Input
                id={`value-${index}`}
                type="text"
                value={rule.value}
                onChange={(e) =>
                  updateFilterRule(index, "value", e.target.value)
                }
                placeholder="0 for empty/zero, or specific value"
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

      {columnsToRemove && setColumnsToRemove && (
        <ColumnsToRemoveSection>
          <ColumnsToRemoveTitle>Columns to Remove</ColumnsToRemoveTitle>
          <InfoText style={{ marginBottom: "0.5rem" }}>
            Entire columns removed regardless of content (after row deletion).
          </InfoText>
          <ColumnTagList>
            {columnsToRemove.map((col, idx) => (
              <ColumnTag key={idx}>
                {col}
                <ColumnTagRemove
                  onClick={() =>
                    setColumnsToRemove(columnsToRemove.filter((_, i) => i !== idx))
                  }
                  aria-label={`Remove column ${col}`}
                >
                  ✕
                </ColumnTagRemove>
              </ColumnTag>
            ))}
          </ColumnTagList>
          <AddColumnRow>
            <Input
              id="add-column-input"
              type="text"
              placeholder="e.g., B"
              style={{ maxWidth: "80px" }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  const val = e.target.value.trim().toUpperCase();
                  if (val && /^[A-Z]{1,3}$/.test(val) && !columnsToRemove.includes(val)) {
                    setColumnsToRemove([...columnsToRemove, val]);
                    e.target.value = "";
                  }
                }
              }}
            />
            <AddButton
              type="button"
              variant="ghost"
              style={{ width: "auto" }}
              onClick={() => {
                const input = document.getElementById("add-column-input");
                if (input) {
                  const val = input.value.trim().toUpperCase();
                  if (val && /^[A-Z]{1,3}$/.test(val) && !columnsToRemove.includes(val)) {
                    setColumnsToRemove([...columnsToRemove, val]);
                    input.value = "";
                  }
                }
              }}
            >
              + Add Column
            </AddButton>
          </AddColumnRow>
        </ColumnsToRemoveSection>
      )}

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
    </FilterConfigContainer>
  );
}

export default FilterConfiguration;
