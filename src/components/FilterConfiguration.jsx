import React from "react";
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

function FilterConfiguration({ filterRules, setFilterRules }) {
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

      <InfoBox>
        <InfoTitle>How it works</InfoTitle>
        <InfoText>
          Rows will be <strong>deleted</strong> if <strong>ALL</strong> filter
          rules match (AND logic).
          <br />
          <br />
          <strong>Value "0" or empty</strong>: Matches empty cells, cells with
          0, "0", or whitespace.
          <br />
          <br />
          <strong>Any other value</strong>: Matches cells that exactly equal
          that value (number or text).
          <br />
          <br />
          Column can be a letter (A, F, Z) or number (1, 6, 26).
          <br />
          <br />
          <strong>Current defaults</strong>: Columns F, G, H, I checking for
          empty/zero.
        </InfoText>
      </InfoBox>
    </FilterConfigContainer>
  );
}

export default FilterConfiguration;
