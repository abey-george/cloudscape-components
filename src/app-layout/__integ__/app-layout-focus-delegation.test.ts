// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { BasePageObject } from '@cloudscape-design/browser-test-tools/page-objects';
import useBrowser from '@cloudscape-design/browser-test-tools/use-browser';
import createWrapper from '../../../lib/components/test-utils/selectors';
import { viewports } from './constants';

const wrapper = createWrapper().findAppLayout();

function setupTest(
  testFn: (page: BasePageObject) => Promise<void>,
  { pageName = 'with-split-panel', visualRefresh = false, splitPanelPosition = '' }
) {
  return useBrowser(async browser => {
    const url = `#/light/app-layout/${pageName}?visualRefresh=${visualRefresh}${
      splitPanelPosition ? `&splitPanelPosition=${splitPanelPosition}` : ''
    }`;
    const page = new BasePageObject(browser);
    await page.setWindowSize(viewports.desktop);
    await browser.url(url);
    await page.waitForVisible(wrapper.findContentRegion().toSelector());
    await testFn(page);
  });
}

[false, true].forEach(visualRefresh =>
  describe(`visualRefresh=${visualRefresh}`, () => {
    test(
      'split panel focus toggles between open and close buttons',
      setupTest(
        async page => {
          await page.click(wrapper.findSplitPanel().findOpenButton().toSelector());
          await page.keys('Enter');
          await expect(page.isFocused(wrapper.findSplitPanel().findOpenButton().toSelector())).resolves.toBe(true);
          await page.keys('Enter');
          await expect(page.isFocused(wrapper.findSplitPanel().findCloseButton().toSelector())).resolves.toBe(true);
          await page.keys('Enter');
          await expect(page.isFocused(wrapper.findSplitPanel().findOpenButton().toSelector())).resolves.toBe(true);
        },
        { pageName: 'with-split-panel', visualRefresh }
      )
    );

    test(
      'tools panel focus toggles between open and close buttons',
      setupTest(
        async page => {
          await page.click(wrapper.findToolsToggle().toSelector());
          await page.keys('Enter');
          await expect(page.isFocused(wrapper.findToolsToggle().toSelector())).resolves.toBe(true);
          await page.keys('Enter');
          await expect(page.isFocused(wrapper.findToolsClose().toSelector())).resolves.toBe(true);
          await page.keys('Enter');
          await expect(page.isFocused(wrapper.findToolsToggle().toSelector())).resolves.toBe(true);
        },
        { pageName: 'with-split-panel', visualRefresh }
      )
    );

    test(
      'navigation panel focus toggles between open and close buttons',
      setupTest(
        async page => {
          await page.click(wrapper.findNavigationClose().toSelector());
          await page.keys('Enter');
          await expect(page.isFocused(wrapper.findNavigationClose().toSelector())).resolves.toBe(true);
          await page.keys('Enter');
          await expect(page.isFocused(wrapper.findNavigationToggle().toSelector())).resolves.toBe(true);
          await page.keys('Enter');
          await expect(page.isFocused(wrapper.findNavigationClose().toSelector())).resolves.toBe(true);
        },
        { pageName: 'with-split-panel', visualRefresh }
      )
    );

    test(
      'focuses tools panel closed button when it is opened using keyboard and caused split panel to change position',
      setupTest(
        async page => {
          await page.setWindowSize({ width: 1000, height: 800 });
          await page.click(wrapper.findSplitPanel().findOpenButton().toSelector());
          await page.keys('Tab');
          await page.keys('Enter');
          await expect(page.isFocused(wrapper.findToolsClose().toSelector())).resolves.toBe(true);
        },
        { pageName: 'with-split-panel', visualRefresh, splitPanelPosition: 'side' }
      )
    );

    test(
      'focuses split panel preferences button when its position changes from bottom to side',
      setupTest(
        async page => {
          await page.click(wrapper.findSplitPanel().findOpenButton().toSelector());
          await page.click(wrapper.findSplitPanel().findPreferencesButton().toSelector());
          await page.keys(['Tab', 'Right', 'Tab', 'Tab', 'Enter']);
          await expect(page.isFocused(wrapper.findSplitPanel().findPreferencesButton().toSelector())).resolves.toBe(
            true
          );
        },
        { pageName: 'with-split-panel', visualRefresh, splitPanelPosition: 'bottom' }
      )
    );

    test(
      'focuses split panel preferences button when its position changes from side to bottom',
      setupTest(
        async page => {
          await page.click(wrapper.findSplitPanel().findOpenButton().toSelector());
          await page.click(wrapper.findSplitPanel().findPreferencesButton().toSelector());
          await page.keys(['Tab', 'Left', 'Tab', 'Tab', 'Enter']);
          await expect(page.isFocused(wrapper.findSplitPanel().findPreferencesButton().toSelector())).resolves.toBe(
            true
          );
        },
        { pageName: 'with-split-panel', visualRefresh, splitPanelPosition: 'side' }
      )
    );

    describe('focus interaction with info links', () => {
      test(
        'moves focus to close button when panel is opened from info link',
        setupTest(
          async page => {
            await page.click(wrapper.findContentRegion().findLink('[data-testid="info-link-1"]').toSelector());
            await expect(page.isFocused(wrapper.findToolsClose().toSelector())).resolves.toBe(true);
          },
          { pageName: 'with-fixed-header-footer', visualRefresh }
        )
      );
      test(
        'moves focus to close button when panel content is changed using second info link',
        setupTest(
          async page => {
            await page.click(wrapper.findContentRegion().findLink('[data-testid="info-link-1"]').toSelector());
            await page.click(wrapper.findContentRegion().findLink('[data-testid="info-link-2"]').toSelector());
            await expect(page.isFocused(wrapper.findToolsClose().toSelector())).resolves.toBe(true);
          },
          { pageName: 'with-fixed-header-footer', visualRefresh }
        )
      );
      test(
        'moves focus back to last opened info link when panel is closed',
        setupTest(
          async page => {
            await page.click(wrapper.findContentRegion().findLink('[data-testid="info-link-1"]').toSelector());
            const infoLink = wrapper.findContentRegion().findLink('[data-testid="info-link-2"]').toSelector();
            await page.click(infoLink);
            await page.click(wrapper.findToolsClose().toSelector());
            await expect(page.isFocused(infoLink)).resolves.toBe(true);
          },
          { pageName: 'with-fixed-header-footer', visualRefresh }
        )
      );
      test(
        'does not move focus back to last opened info link when panel has lost focus - instead focuses tools toggle',
        setupTest(
          async page => {
            const infoLink = wrapper.findContentRegion().findLink('[data-testid="info-link-2"]').toSelector();
            await page.click(infoLink);
            await page.click(wrapper.findContentRegion().findContainer().toSelector());
            await page.click(wrapper.findToolsClose().toSelector());
            await expect(page.isFocused(infoLink)).resolves.toBe(false);
            await expect(page.isFocused(wrapper.findToolsToggle().toSelector())).resolves.toBe(true);
          },
          { pageName: 'with-fixed-header-footer', visualRefresh }
        )
      );
    });
  })
);
